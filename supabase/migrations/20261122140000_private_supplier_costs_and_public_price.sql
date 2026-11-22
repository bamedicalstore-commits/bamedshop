-- BA Medical Store — prix fournisseurs privés et prix public unique
-- Approuvé par AB le 2026-11-22 (staging d'abord).
--
-- Problème corrigé : products.price contenait le prix liste fournisseur HT
-- (seed 20260812190000) alors que :
--   * la colonne est lisible par anon/authenticated sur les produits actifs ;
--   * resolve_product_price() facture products.price au client.
-- Activer un produit aurait donc publié et facturé le prix fournisseur.
--
-- Après cette migration :
--   1. Le prix fournisseur vit dans public.product_costs (admins uniquement).
--   2. products.price = prix public de vente, dérivé UNIQUEMENT de
--      retail_price_tnd quand retail_price_approved = true ; sinon NULL
--      (« Prix sur WhatsApp »). resolve_product_price() renvoie alors NULL et
--      les triggers panier/commande refusent le produit (« Product unavailable »).

-- 1) Table privée des prix fournisseurs
create table if not exists public.product_costs (
  product_id uuid primary key references public.products (id) on delete cascade,
  supplier_list_price_ht numeric(12, 3) not null check (supplier_list_price_ht >= 0),
  currency text not null default 'TND',
  source text,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);

comment on table public.product_costs is
  'Prix liste fournisseur HT (confidentiel). Lecture et écriture réservées aux rôles admin et super_admin. Ne jamais exposer côté public.';

alter table public.product_costs enable row level security;

revoke all on public.product_costs from anon;
revoke all on public.product_costs from authenticated;
grant select, insert, update, delete on public.product_costs to authenticated;

drop policy if exists "product_costs_admin_all" on public.product_costs;
create policy "product_costs_admin_all" on public.product_costs
for all to authenticated
using (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  or public.has_role(auth.uid(), 'super_admin'::public.app_role)
)
with check (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  or public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

drop trigger if exists trg_product_costs_updated_at on public.product_costs;
create trigger trg_product_costs_updated_at
before update on public.product_costs
for each row execute function public.set_updated_at();

-- 2) Déplacer les prix fournisseurs hors de products
insert into public.product_costs (product_id, supplier_list_price_ht, currency, source)
select p.id, p.price, p.currency, 'products.price (seed fournisseur) avant 2026-11-22'
from public.products p
where p.price is not null
on conflict (product_id) do nothing;

-- 3) products.price devient le prix public, dérivé du prix de vente approuvé
alter table public.products alter column price drop not null;

create or replace function public.sync_products_public_price()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.price := case
    when new.retail_price_approved and coalesce(new.retail_price_tnd, 0) > 0
      then new.retail_price_tnd
    else null
  end;
  return new;
end;
$$;

comment on function public.sync_products_public_price() is
  'products.price = retail_price_tnd si retail_price_approved, sinon NULL (prix sur WhatsApp). Empêche de publier ou facturer un prix fournisseur.';

drop trigger if exists trg_products_public_price on public.products;
create trigger trg_products_public_price
before insert or update on public.products
for each row execute function public.sync_products_public_price();

-- Recalcule toutes les lignes existantes via le trigger.
update public.products set price = price;
