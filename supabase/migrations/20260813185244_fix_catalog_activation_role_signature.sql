-- BA Medical Store — Fix catalog activation role signature
-- Canonical signature: public.has_role(uuid, public.app_role).
-- This migration removes the temporary compatibility overload and aligns
-- activation RPCs/policies with the canonical RBAC helper signature.

create or replace function public.activate_catalog_product(p_product_id uuid)
returns table (product_id uuid, status public.catalog_activation_status, reason public.catalog_activation_reason)
language plpgsql security invoker set search_path = public
as $$
declare decision record; previous_status public.catalog_activation_status;
begin
  if not (public.has_role(auth.uid(), 'admin'::public.app_role) or public.has_role(auth.uid(), 'super_admin'::public.app_role)) then
    raise exception 'catalog_activation_forbidden';
  end if;

  select p.catalog_activation_status into previous_status from public.products p where p.id = p_product_id for update;
  if previous_status is null then
    return query select p_product_id, 'BLOCKED'::public.catalog_activation_status, 'archived'::public.catalog_activation_reason;
    return;
  end if;

  select * into decision from public.evaluate_catalog_activation(p_product_id);
  if not coalesce(decision.ok, false) then
    update public.products set catalog_activation_status = 'BLOCKED', catalog_activation_reason = decision.reason,
      retail_activated_at = null, retail_activated_by = null, retail_updated_at = now() where id = p_product_id;
    insert into public.catalog_activation_events(product_id, from_status, to_status, reason, actor_id)
      values (p_product_id, previous_status, 'BLOCKED', decision.reason, auth.uid());
    return query select p_product_id, 'BLOCKED'::public.catalog_activation_status, decision.reason;
    return;
  end if;

  update public.products set catalog_activation_status = 'ACTIVE', catalog_activation_reason = 'ready',
    retail_activated_at = now(), retail_activated_by = auth.uid(), retail_updated_at = now() where id = p_product_id;
  insert into public.catalog_activation_events(product_id, from_status, to_status, reason, actor_id)
    values (p_product_id, previous_status, 'ACTIVE', 'ready', auth.uid());
  return query select p_product_id, 'ACTIVE'::public.catalog_activation_status, 'ready'::public.catalog_activation_reason;
end;
$$;

create or replace function public.deactivate_catalog_product(p_product_id uuid, p_reason public.catalog_activation_reason default 'archived')
returns table (product_id uuid, status public.catalog_activation_status, reason public.catalog_activation_reason)
language plpgsql security invoker set search_path = public
as $$
declare previous_status public.catalog_activation_status;
begin
  if not (public.has_role(auth.uid(), 'admin'::public.app_role) or public.has_role(auth.uid(), 'super_admin'::public.app_role)) then
    raise exception 'catalog_activation_forbidden';
  end if;

  select p.catalog_activation_status into previous_status from public.products p where p.id = p_product_id for update;
  if previous_status is null then
    return query select p_product_id, 'BLOCKED'::public.catalog_activation_status, p_reason;
    return;
  end if;

  update public.products set catalog_activation_status = 'BLOCKED', catalog_activation_reason = p_reason,
    retail_activated_at = null, retail_activated_by = null, retail_updated_at = now() where id = p_product_id;
  insert into public.catalog_activation_events(product_id, from_status, to_status, reason, actor_id)
    values (p_product_id, previous_status, 'BLOCKED', p_reason, auth.uid());
  return query select p_product_id, 'BLOCKED'::public.catalog_activation_status, p_reason;
end;
$$;

drop policy if exists "catalog activation events staff read" on public.catalog_activation_events;
create policy "catalog activation events staff read" on public.catalog_activation_events
for select to authenticated using (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  or public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

comment on function public.activate_catalog_product(uuid) is 'Final fail-closed database boundary for retail activation. Admin/super_admin only.';
