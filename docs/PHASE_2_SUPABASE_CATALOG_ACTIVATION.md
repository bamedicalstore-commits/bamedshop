# BA Medical Store — Phase 2: Supabase Catalog Activation Engine

The retail activation engine is now designed as a two-layer safety system: a deterministic TypeScript domain gate plus a PostgreSQL activation boundary.

## State machine

`DRAFT -> REVIEW -> APPROVED -> ACTIVE`

Safety terminal state: `BLOCKED`.

## Database authority

Only the database activation RPC may transition a product to `ACTIVE`. It verifies the retail price, explicit retail-price approval, media approval, customer-copy approval, product activity and slug validity inside the same transaction.

Supplier/list prices are never accepted as retail approval.

## Security

Activation and deactivation require `admin` or `super_admin` through the existing `public.has_role` authorization function. Activation events are protected by RLS. The browser continues to use only the Supabase publishable key; no service-role credential is introduced.

## Customer projection

`public.retail_catalog` exposes only active products whose activation status is `ACTIVE`. The storefront must use this projection for customer-facing catalog reads once the migration is live.

## Admin

`/admin/catalog` provides the operational activation queue, gate visibility, activation/deactivation controls and deterministic error feedback.

## Next hardening

Apply the migration to the real Supabase project, regenerate the generated database types from the live schema, then connect the authoritative supplier import pipeline to the activation queue.
