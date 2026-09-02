-- BA Medical Store — S5 canonical security authority
-- Reproducible, production-safe definition of the approved D1/D2/D3 boundaries.
-- D1: public/authenticated retail visibility requires active + ACTIVE catalog status.
-- D2: gross subtotal < 200 TND => 8 TND shipping; >= 200 TND => free shipping.
-- D3: staff uses the same DB shipping rule; staff does not bypass shipping authority.

drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active" on public.products
for select to anon using (
  active = true
  and catalog_activation_status = 'ACTIVE'::public.catalog_activation_status
);

drop policy if exists "products_auth_read" on public.products;
create policy "products_auth_read" on public.products
for select to authenticated using (
  (active = true and catalog_activation_status = 'ACTIVE'::public.catalog_activation_status)
  or public.is_staff(auth.uid())
);

create or replace function public.enforce_order_shipping_authority()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.shipping_cost := case
    when coalesce(new.subtotal, 0) >= 200 then 0
    else 8.000
  end;
  return new;
end;
$$;

drop trigger if exists trg_orders_shipping_authority on public.orders;
create trigger trg_orders_shipping_authority
before insert or update on public.orders
for each row execute function public.enforce_order_shipping_authority();

comment on function public.enforce_order_shipping_authority() is
  'DB authority for BA Medical Store shipping: subtotal < 200 TND => 8 TND; subtotal >= 200 TND => 0 TND. Applies to staff and non-staff.';
