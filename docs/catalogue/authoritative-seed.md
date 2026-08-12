# BA Medical Store — authoritative catalogue seed

## Status

This migration imports a real supplier product master into the existing `products`, `categories`, `brands` and `suppliers` tables.

**All imported products are `active = false`.** They are not published to the public catalogue yet.

Reason: the available supplier documents provide supplier/PV prices HT, not a validated BA Medical Store public retail price policy. Publishing those values as customer prices would be an unsupported commercial inference.

## Sources used

1. `LISTE DES PRIX PHARMATEC_ (2).pdf`
   - Supplier: Pharmatec
   - Document date stated in source: MAJ AOUT 2024
   - Price field: `PU HT`
   - VAT percentage is preserved per source row.
2. `LISTE DES PRIX ROSSMAX (1).pdf`
   - Brand/source: Rossmax
   - Price field: `PV HT`
   - VAT percentage is preserved per source row.

The source documents are uploaded project references; the migration does not invent product specifications, stock quantities, retail margins, promotions, warranties or media.

## Imported scope

- 25 Rossmax source rows.
- 20 Pharmatec source rows.
- 45 source product rows total.
- Supplier/brand/category mappings are explicit in the migration.
- Source provenance is stored in `products.technical_specs` under `source_document`, `source_price_type`, `source_vat_percent` and `catalog_status`.

## Activation rule

A product may only be switched to `active = true` after BA Medical Store has a validated customer-facing price for that SKU. The migration intentionally leaves `professional_price` null and does not convert supplier prices into retail prices.

The existing public Server Functions already filter `products.active = true`, so this seed cannot accidentally expose the imported source-price rows.

## Commercial conditions

The supplier documents contain quantity/free-unit conditions. These are deliberately not converted into public promotions in this migration. They require a separate commercial-rule mapping and must not be silently interpreted as customer promotions.

## Next gate

1. Apply migration to the connected Supabase project.
2. Verify exactly 45 product rows are inserted and all are inactive.
3. Verify supplier/category/brand foreign-key resolution.
4. Verify `/catalogue` remains empty publicly until retail prices are validated.
5. Add validated BA retail prices through the controlled import path.
6. Activate only validated SKUs.
7. Run GENESIS Builder Probe and a real `/catalogue` + `/product/:slug` smoke against active rows.
