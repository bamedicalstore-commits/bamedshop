# Phase 2 — Supabase Catalog Activation Rollout

## Scope

This phase turns the previously pure retail activation gate into a database-backed activation boundary and gives administrators an operational console.

## Delivered

- Supabase migration for retail activation state.
- Explicit retail price and approval fields.
- Fail-closed activation evaluation in PostgreSQL.
- Admin/super-admin-only activation and deactivation RPCs.
- Append-only activation event history.
- `retail_catalog` customer-facing projection restricted to `ACTIVE` + active products.
- Admin activation queue at `/admin/catalog`.
- Browser-side repository uses only the Supabase publishable key; no service-role secret is introduced.
- CI contract test ensures the database boundary remains admin-only and fail-closed.

## Operational rule

The application may display a readiness preview, but only the database RPC may transition a product to `ACTIVE`.

## Next hardening phase

- Apply migration to the real Supabase project.
- Regenerate `src/integrations/supabase/types.ts` from the live schema.
- Add integration smoke tests against a disposable Supabase database.
- Add product/category/brand import pipeline into the activation queue.
- Add immutable approval records for retail price, media and copy.
