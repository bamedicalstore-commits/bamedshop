# Authoritative catalogue seed

This migration records the real supplier product master currently available in the project references.

Sources:
- `LISTE DES PRIX PHARMATEC_ (2).pdf` — MAJ AOUT 2024 — `PU HT`.
- `LISTE DES PRIX ROSSMAX (1).pdf` — `PV HT`.

Imported scope: 45 product rows (25 Rossmax + 20 Pharmatec), with explicit supplier, brand and category mappings.

All rows are intentionally `active = false` because the source values are supplier/PV HT prices, not validated BA Medical Store customer retail prices. The migration does not invent retail margins, stock, promotions, warranties or product media.

Source provenance is retained in `products.technical_specs`:
- `catalog_status = source_import_unpriced`
- `source_document`
- `source_price_type`
- `source_vat_percent`
- source date/upload metadata

Activation rule: a SKU becomes publicly active only after a validated BA Medical Store customer-facing price is available. This prevents supplier cost/list prices from being exposed as retail prices.

The migration is idempotent on product SKU and reference slugs. The connected Supabase database has already been seeded with the same 45 inactive rows during the controlled product-activation step; merging this migration keeps repository history reproducible without duplicating records.
