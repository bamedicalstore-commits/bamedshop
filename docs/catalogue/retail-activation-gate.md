# BA Medical Store — retail activation gate

## Current evidence

The real supplier catalogue contains 45 source rows:

- 25 Rossmax rows from `LISTE DES PRIX ROSSMAX (1).pdf`.
- 20 Pharmatec rows from `LISTE DES PRIX PHARMATEC_ (2).pdf` (MAJ AOUT 2024).

The source documents contain supplier/list prices (`PV HT` / `PU HT`). They do **not** establish the validated BA Medical Store customer-facing retail price.

The repository is public. Supplier/list prices must therefore not be copied into a public retail activation matrix or exposed as customer prices.

## Activation contract

A SKU is eligible for public activation only when all required customer-facing data is present:

1. `retail_price_tnd` is explicitly supplied and approved by BA Medical Store.
2. `active` can then be switched to `true` for that SKU only.
3. Product media is approved and mapped to the SKU.
4. Customer-facing copy is approved; source-only supplier descriptions are not treated as final marketing copy.
5. No supplier quantity/free-unit condition is silently converted into a customer promotion.

Until these conditions are met, imported source rows remain inactive.

## Matrix

`retail-activation-matrix.csv` is deliberately free of supplier price amounts. It is the controlled hand-off surface for validated retail prices and activation readiness.

## Non-inference rule

Do not derive a retail price by applying an assumed margin, rounding supplier prices, copying competitor prices, or converting supplier free-unit conditions into public promotions. Those would be commercial inferences, not source facts.
