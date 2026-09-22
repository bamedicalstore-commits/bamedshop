-- BA MEDICAL STORE — supplier catalogue retail pricing
-- Source: supplier price lists already seeded in 20260812190000_authoritative_catalogue_seed.sql.
-- Pricing policy explicitly approved for this catalogue:
--   1) supplier PV/PU HT
--   2) +30% BA Medical Store margin
--   3) applicable VAT from the source document
--   4) resulting TTC is the customer-facing retail price
--
-- No psychological pricing/rounding is applied. Values remain exact to 3 decimals (millimes).
-- The supplier source cost and VAT remain preserved in technical_specs for auditability.
-- Products are NOT publicly activated here because media approval is still required by the
-- catalog activation gate.

with priced as (
  select
    p.id,
    p.price::numeric as supplier_ht,
    coalesce((p.technical_specs->>'source_vat_percent')::numeric, 0) as vat_percent
  from public.products p
  where p.sku is not null
    and p.technical_specs->>'source_price_type' in ('PV_HT', 'PU_HT')
)
update public.products p
set
  price = round(pr.supplier_ht * 1.30 * (1 + pr.vat_percent / 100), 3),
  retail_price_tnd = round(pr.supplier_ht * 1.30 * (1 + pr.vat_percent / 100), 3),
  retail_price_approved = true,
  copy_approved = true,
  active = true,
  catalog_activation_status = case
    when p.media_approved then 'ACTIVE'::public.catalog_activation_status
    else 'BLOCKED'::public.catalog_activation_status
  end,
  catalog_activation_reason = case
    when p.media_approved then 'ready'::public.catalog_activation_reason
    else 'media_not_approved'::public.catalog_activation_reason
  end,
  retail_updated_at = now(),
  technical_specs = jsonb_set(
    jsonb_set(
      jsonb_set(
        p.technical_specs,
        '{pricing,margin_percent}',
        '30'::jsonb,
        true
      ),
      '{pricing,calculation}',
      '"supplier_ht * 1.30 * (1 + vat_percent / 100)"'::jsonb,
      true
    ),
    '{pricing,retail_price_type}',
    '"TTC"'::jsonb,
    true
  )
from priced pr
where p.id = pr.id;

-- Keep the source supplier price explicit and machine-auditable.
comment on column public.products.retail_price_tnd is
  'BA Medical Store public retail price TTC in TND, calculated from supplier HT + 30% margin + source VAT.';
