# BA Medical OS — Current State Evidence Ledger

**Date:** 2026-08-12
**Purpose:** supersede stale assumptions with a short, evidence-based snapshot of the repository, CI and deployed Supabase database.

## 1. Git / CI

- `main` currently points to `9e95a3c65bc4ed55fb19d83211e71fa0a02e5cbf` after the architecture-truth README synchronization.
- GENESIS Builder Probe run #49 on the preceding `main` commit `681b62ecc395e7418dab41453b6da2b73ebd9022` completed **SUCCESS**.
- GENESIS Builder Probe run #50 is the validation run for this current documentation commit and must be treated as the active CI gate until it completes.
- The established release gate is:

```text
Install PASS
Prettier PASS
Lint PASS
Build PASS
SERVER_READY PASS
routes PASS
RUNTIME_SMOKE=PASS
```

## 2. Runtime architecture actually implemented

The repository is TanStack Start + React + TypeScript + Vite/Tailwind/shadcn, with Supabase integration and Cloudflare-module runtime validation through Wrangler/workerd.

The public catalogue is **not purely static anymore**. The repository contains `src/lib/catalog.functions.ts`, which exposes two read-only TanStack Server Functions:

- `listPublicProducts`
- `getPublicProductBySlug`

The functions query Supabase `products` and related `brands`, `categories`, `product_media` and `product_documents`, and are restricted to active public products.

`src/routes/catalogue.tsx` imports `listPublicProducts`, invokes it through `useServerFn`, and maps the returned database rows through `src/lib/mappers`.

Therefore the earlier statement that there are no Server Functions / that the catalogue route is entirely static is stale and must not be repeated as a current fact.

## 3. Supabase database — direct verification

The connected project database currently exposes 29 public tables:

```text
addresses
brands
cart_items
carts
categories
client_documents
coupons
notification_preferences
notifications
order_items
order_picking_items
orders
pack_products
packs
payments
product_documents
product_media
product_relations
products
profiles
promotion_categories
promotions
shipments
subscription_plans
subscriptions
suppliers
user_roles
warranties
wishlist_items
```

A direct row-count check on the core commerce/catalogue tables returned zero rows for:

```text
brands
cart_items
carts
categories
order_items
orders
products
suppliers
```

This means the current public catalogue data path is implemented, but the connected database is currently empty for the checked core entities. A green runtime/build does **not** prove catalogue content exists.

## 4. Public catalogue security model — direct verification

The database currently contains public read policies for:

- `products_public_read_active` on `products` for `anon` SELECT;
- public SELECT policies on `brands`, `categories`, `product_media`, and `product_documents` for `anon` and `authenticated` where defined.

Staff write policies exist on these catalogue tables for authenticated users according to the deployed RLS policy set.

The public catalogue Server Functions use the publishable Supabase key and do not use an admin/service-role client.

## 5. What is proven vs not proven

### Proven

- Runtime artifact builds.
- Runtime smoke gate passed on run #49.
- Public catalogue Server Functions exist.
- `/catalogue` consumes the public catalogue Server Function.
- Supabase is connected and contains the 29 deployed tables listed above.
- Public catalogue RLS policies exist.

### Not proven

- Production catalogue completeness: checked core catalogue tables are empty.
- Pharmatec synchronization: no live supplier synchronization contract has been proven in the current repository/database.
- Full inventory/warehouse domain: target documents describe it, but the deployed database does not currently expose those tables.
- Full enterprise API contract parity: the historical `openapi.yaml` is not versioned in the current repository.

## 6. Next engineering gate

The next real product gate is **Catalogue Data Activation**, not another cosmetic UI pass:

1. obtain an authoritative BA Medical Store catalogue source (supplier export, approved CSV/XLSX, or verified product master);
2. map it to the existing `products`, `categories`, `brands`, `suppliers`, `product_media` and `product_documents` schema without inventing missing fields;
3. import/seed through a reviewed migration or controlled admin import path;
4. verify row counts and representative product queries directly in Supabase;
5. run the full GENESIS Builder Probe again;
6. smoke-test `/catalogue` and `/product/:slug` against real rows;
7. only then expand commerce/inventory functionality.

No fabricated product catalogue data is allowed merely to make the UI appear populated.
