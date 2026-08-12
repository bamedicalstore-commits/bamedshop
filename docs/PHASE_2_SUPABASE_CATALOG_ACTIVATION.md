# BA Medical Store — Phase 2: Supabase Catalog Activation Engine

## Objective

Connect the fail-closed retail activation engine to Supabase without allowing supplier data to become customer-visible merely because it exists in the database.

## State machine

`DRAFT -> REVIEW -> APPROVED -> ACTIVE`

Terminal safety state:

`BLOCKED`

An item may be `ACTIVE` only when the database-side activation function verifies all retail gates at transaction time.

## Retail gates

1. A positive BA Medical Store retail price exists.
2. The retail price is explicitly approved.
3. Media is explicitly approved.
4. Customer-facing copy is explicitly approved.
5. The product is not deleted/archived.
6. The product has a valid public slug.

Supplier/list price is never used as the retail activation price.

## Database authority

The database becomes the persistence authority for activation state and activation history. The application-level TypeScript gate remains the pure domain policy and is used as a deterministic preflight check. The database RPC is the final write boundary.

## Security

- Customer reads must be limited to `ACTIVE` products.
- Retail activation writes must be restricted to authenticated staff/admin roles.
- Activation history is append-only from the application perspective.
- No service-role secret is shipped to the browser.
- Failed activation attempts return a deterministic reason and do not partially activate a product.

## Rollout

1. Add activation columns and enums.
2. Add activation audit/history.
3. Add database-side `activate_catalog_product` RPC.
4. Add RLS policies.
5. Add server repository adapter.
6. Add admin catalog queue and activation actions.
7. Add CI tests for database contract and fail-closed behavior.
8. Only then expose ACTIVE records to the storefront.
