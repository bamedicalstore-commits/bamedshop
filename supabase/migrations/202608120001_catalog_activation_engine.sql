-- BA Medical Store — Catalog Activation Engine / Phase 2
-- Database is the final activation boundary. Keep the TypeScript domain gate pure and deterministic.

create type public.catalog_activation_status as enum (
  'DRAFT',
  'REVIEW',
  'APPROVED',
  'ACTIVE',
  'BLOCKED'
);

create type public.catalog_activation_reason as enum (
  'ready',
  'missing_retail_price',
  'retail_price_not_approved',
  'media_not_approved',
  'copy_not_approved',
  'missing_slug',
  'archived'
);

alter table public.products
  add column if not exists retail_price_tnd numeric(12,3),
  add column if not exists retail_price_approved boolean not null default false,
  add column if not exists media_approved boolean not null default false,
  add column if not exists copy_approved boolean not null default false,
  add column if not exists catalog_activation_status public.catalog_activation_status not null default 'DRAFT',
  add column if not exists catalog_activation_reason public.catalog_activation_reason,
  add column if not exists retail_activated_at timestamptz,
  add column if not exists retail_activated_by uuid,
  add column if not exists retail_updated_at timestamptz not null default now();

create index if not exists products_catalog_activation_status_idx
  on public.products (catalog_activation_status);

create index if not exists products_active_catalog_idx
  on public.products (catalog_activation_status, active)
  where catalog_activation_status = 'ACTIVE' and active = true;

create table if not exists public.catalog_activation_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  from_status public.catalog_activation_status,
  to_status public.catalog_activation_status not null,
  reason public.catalog_activation_reason not null,
  actor_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists catalog_activation_events_product_idx
  on public.catalog_activation_events (product_id, created_at desc);

create or replace function public.evaluate_catalog_activation(p_product_id uuid)
returns table (
  ok boolean,
  reason public.catalog_activation_reason
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    (
      p.retail_price_tnd is not null
      and p.retail_price_tnd > 0
      and p.retail_price_approved
      and p.media_approved
      and p.copy_approved
      and coalesce(p.active, true)
      and nullif(trim(p.slug), '') is not null
    ) as ok,
    case
      when p.retail_price_tnd is null or p.retail_price_tnd <= 0 then 'missing_retail_price'::public.catalog_activation_reason
      when not p.retail_price_approved then 'retail_price_not_approved'::public.catalog_activation_reason
      when not p.media_approved then 'media_not_approved'::public.catalog_activation_reason
      when not p.copy_approved then 'copy_not_approved'::public.catalog_activation_reason
      when not coalesce(p.active, true) then 'archived'::public.catalog_activation_reason
      when nullif(trim(p.slug), '') is null then 'missing_slug'::public.catalog_activation_reason
      else 'ready'::public.catalog_activation_reason
    end as reason
  from public.products p
  where p.id = p_product_id;
$$;

create or replace function public.activate_catalog_product(p_product_id uuid)
returns table (
  product_id uuid,
  status public.catalog_activation_status,
  reason public.catalog_activation_reason
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  decision record;
  previous_status public.catalog_activation_status;
begin
  select p.catalog_activation_status
    into previous_status
  from public.products p
  where p.id = p_product_id
  for update;

  if previous_status is null then
    return query select p_product_id, 'BLOCKED'::public.catalog_activation_status, 'archived'::public.catalog_activation_reason;
    return;
  end if;

  select * into decision
  from public.evaluate_catalog_activation(p_product_id);

  if not coalesce(decision.ok, false) then
    update public.products
      set catalog_activation_status = 'BLOCKED',
          catalog_activation_reason = decision.reason,
          retail_activated_at = null,
          retail_activated_by = null,
          retail_updated_at = now()
    where id = p_product_id;

    insert into public.catalog_activation_events(product_id, from_status, to_status, reason, actor_id)
    values (p_product_id, previous_status, 'BLOCKED', decision.reason, auth.uid());

    return query select p_product_id, 'BLOCKED'::public.catalog_activation_status, decision.reason;
    return;
  end if;

  update public.products
    set catalog_activation_status = 'ACTIVE',
        catalog_activation_reason = 'ready',
        retail_activated_at = now(),
        retail_activated_by = auth.uid(),
        retail_updated_at = now()
  where id = p_product_id;

  insert into public.catalog_activation_events(product_id, from_status, to_status, reason, actor_id)
  values (p_product_id, previous_status, 'ACTIVE', 'ready', auth.uid());

  return query select p_product_id, 'ACTIVE'::public.catalog_activation_status, 'ready'::public.catalog_activation_reason;
end;
$$;

create or replace function public.deactivate_catalog_product(p_product_id uuid, p_reason public.catalog_activation_reason default 'archived')
returns table (
  product_id uuid,
  status public.catalog_activation_status,
  reason public.catalog_activation_reason
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  previous_status public.catalog_activation_status;
begin
  select p.catalog_activation_status
    into previous_status
  from public.products p
  where p.id = p_product_id
  for update;

  if previous_status is null then
    return query select p_product_id, 'BLOCKED'::public.catalog_activation_status, p_reason;
    return;
  end if;

  update public.products
    set catalog_activation_status = 'BLOCKED',
        catalog_activation_reason = p_reason,
        retail_activated_at = null,
        retail_activated_by = null,
        retail_updated_at = now()
  where id = p_product_id;

  insert into public.catalog_activation_events(product_id, from_status, to_status, reason, actor_id)
  values (p_product_id, previous_status, 'BLOCKED', p_reason, auth.uid());

  return query select p_product_id, 'BLOCKED'::public.catalog_activation_status, p_reason;
end;
$$;

create or replace view public.retail_catalog as
select p.*
from public.products p
where p.active = true
  and p.catalog_activation_status = 'ACTIVE';

alter table public.catalog_activation_events enable row level security;

-- The RPC is deliberately security-invoker: existing product/admin RLS remains the authorization boundary.
-- Customer-facing reads are represented by the retail_catalog view and must be backed by product RLS.

comment on table public.catalog_activation_events is
  'Append-only audit trail for BA Medical Store retail catalog activation decisions.';
comment on function public.activate_catalog_product(uuid) is
  'Final fail-closed database boundary for retail activation.';
comment on view public.retail_catalog is
  'Customer-facing product projection: ACTIVE and non-archived products only.';
