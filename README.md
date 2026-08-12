# BA Medical Store — Med Store Architect

BA Medical Store is a Tunisian medical-equipment e-commerce platform. This repository is the engineering source of truth for the current application and its architecture convergence work.

## Current mission

Build a maintainable, scalable, secure and reusable medical-commerce platform that can evolve from the current Pharmatec-oriented catalogue into a multi-supplier, multi-brand and multi-warehouse platform.

Target users include individuals, doctors, nurses, physiotherapists, clinics and companies.

## Current verified stack

The repository currently runs on:

- TanStack Start v1
- Vite 7/8 build toolchain as pinned by the repository
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui / Radix UI
- TanStack Router
- TanStack Query
- Supabase client integration for the current cloud backend
- Bun 1.2.20 in CI
- Node.js 22 in CI

The runtime artifact is validated as a Cloudflare Worker/module through Wrangler + workerd in the GENESIS Builder Probe.

> Historical architecture documents may mention Next.js, Prisma, Clerk, Cloudinary or Vercel. Those are target/historical claims, not the current verified implementation. Do not use them as implementation facts without re-verification.

## Current architecture reality

The application is intentionally being converged in controlled stages. The current repository is not yet the full enterprise architecture described by historical planning documents.

Verified convergence facts are maintained in:

- `docs/architecture/BA_MEDICAL_OS_CONVERGENCE_STATUS.md`
- `docs/architecture/README.md`
- `docs/architecture/FRONTEND.md`

Current known boundaries include:

- the frontend still contains static catalogue constants in parts of the public experience;
- the database contains the currently deployed Supabase schema, which is smaller than the historical target schema;
- the repository does not currently contain the historical `openapi.yaml` contract;
- business Repository / Server Function layers are not yet the canonical application boundary;
- warehouse/stock/security-event domains described in target documents are not assumed to exist until migrations and runtime evidence prove them.

No implementation should be created from a historical claim when the current repository or database does not prove it.

## Domain target

The long-term domain map is:

### Public
Home, Catalogue, Product, Search, Categories, Brands, Blog, Contact, FAQ.

### Customer
Authentication, Profile, Orders, Wishlist, Medical Cabinet, BA Medical+, Addresses, Notifications.

### Commerce
Cart, Checkout, Coupons, Payments, Shipping, Returns, Refunds.

### Catalog
Products, Categories, Brands, Attributes, Variants, Images, Documents.

### Inventory
Warehouses, Stock, Stock Movements, Suppliers, Purchase Orders, Expiration Dates, Batches.

### CRM
Customers, Leads, Companies, Notes, Activities.

### Marketing
Promotions, Discounts, Email, WhatsApp, Blog, Landing Pages.

### AI
Assistant, Smart Search, Recommendations, Product Description Generator, SEO Generator.

### Administration
Dashboard, Users, Roles, Permissions, Logs, Settings.

These are architectural targets, not proof that every domain is already implemented.

## Engineering principles

1. **Evidence before inference.** Repository, database and CI evidence outrank historical plans.
2. **No silent architecture invention.** Missing contracts, tables or domains are not fabricated to make a document look complete.
3. **Small blast radius.** Prefer isolated, reversible changes with deterministic regression gates.
4. **Single source of truth.** Keep application behavior, database migrations, contracts and architecture documentation synchronized.
5. **Regression before expansion.** New business functionality must not bypass the established build/runtime validation.
6. **Security by default.** Local environment files stay out of Git; secrets must never be committed.

## GENESIS Builder Probe — release gate

The main branch is protected by a deterministic build/runtime smoke workflow:

```text
Install PASS
Prettier PASS
Lint PASS
Build PASS
SERVER_READY PASS
routes PASS
RUNTIME_SMOKE=PASS
```

The probe validates the production Cloudflare-module artifact, waits for actual HTTP readiness, exercises the core public/customer routes, and fails on `5xx` or transport failure.

Compatibility-date fallback is permitted only when workerd explicitly reports a supported-date mismatch; unrelated runtime failures remain hard failures.

## Security hygiene

Local environment files are ignored by Git. Use `.env.example` as the safe variable-name template and provide real values through the local/CI secret mechanism.

## Development

```sh
git clone <this-repository-url>
cd bamedshop
bun install --frozen-lockfile
bun run dev
```

Useful checks:

```sh
bunx prettier --check .
bun run lint
bun run build
```

## Lovable

This project is developed with Lovable and synchronized with GitHub.

**Live app:** https://bamedshop.lovable.app

**Lovable project:** https://lovable.dev/projects/54231c69-e211-4e81-856a-cb2397eb8d28

## Change discipline

Before changing a domain, first establish the current repository/database state. After a change, run the deterministic CI gate and record any architectural consequence in the convergence documentation.
