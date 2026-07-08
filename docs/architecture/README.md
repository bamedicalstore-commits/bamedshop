# BA Medical Store — Enterprise Architecture (v2.0, Lovable-native)

> Document de référence officiel — aligné sur la **stack native Lovable**.
> Tous les agents (Frontend, Backend, Database, QA, Security, SEO, AI, DevOps) doivent s'y référer.

---

## 1. Vision

Plateforme e-commerce tunisienne de matériel médical (lancement catalogue **Pharmatec Tunisie**), destinée aux particuliers et professionnels de santé (médecins, infirmiers, kinés, cliniques, entreprises).

**Cible 10 ans** : multi-fournisseurs, multi-marques, multi-entrepôts, multi-devises, sans refonte majeure.

**Axes non-négociables** : maintenabilité · scalabilité · performance · sécurité · réutilisabilité.

---

## 2. Stack — 100% Lovable-native

| Couche | Technologie officielle Lovable | Rôle |
|---|---|---|
| Framework | **TanStack Start v1** (React 19, TypeScript strict) | SSR, streaming, file-based routing |
| Build | **Vite 7** | Bundler unique |
| Runtime serveur | **Cloudflare Workers** (nodejs_compat) | Edge, faible latence |
| Styling | **Tailwind CSS v4** (via `src/styles.css`) | Design tokens |
| Composants | **shadcn/ui** (customisés via variants) | UI system |
| Backend applicatif | **Server Functions** (`createServerFn`) | RPC typé client↔serveur |
| Backend HTTP public | **Server Routes** (`src/routes/api/public/*`) | Webhooks, cron, APIs externes |
| Database | **Lovable Cloud** (Postgres managé + RLS) | Données, auth, storage |
| Auth | **Lovable Cloud Auth** (email, magic link, OAuth Google/Apple) | Sessions, RBAC |
| Storage | **Lovable Cloud Storage** (buckets) | Images produits, docs |
| IA | **Lovable AI Gateway** (`LOVABLE_API_KEY`) | Chat, embeddings, image gen |
| Email transactionnel | **Lovable Email** (Seamless Emails via connectors) | Confirmations, resets |
| Connecteurs externes | **Standard Connectors** (Stripe, Resend, etc.) | Paiement, SMS |
| Déploiement | **Lovable Publish** | Preview + prod stables |
| Observabilité | **Lovable runtime errors** + `reportLovableError` | Erreurs SSR & client |

**Ce qu'on N'utilise PAS** (et pourquoi) :
- ❌ Next.js / Remix / Nuxt → non natifs Lovable.
- ❌ Prisma → Lovable Cloud fournit un client Supabase généré et des migrations SQL.
- ❌ Redis / BullMQ / NATS → workers Cloudflare non compatibles ; on utilise pg_cron + Postgres queue + Server Routes webhooks.
- ❌ Clerk, Auth0 → Lovable Cloud Auth couvre le besoin.
- ❌ Cloudinary → Lovable Cloud Storage suffit ; transformations via edge.
- ❌ Meilisearch externe (phase 1) → Postgres `pg_trgm` + `tsvector` + `pgvector` couvrent v1. Migration search possible plus tard sans changer l'architecture (adapter).

---

## 3. Structure du projet (mono-app, Lovable-native)

Lovable projet = **une application** (pas de monorepo pnpm). L'isolation modulaire se fait **par dossiers de domaines** dans `src/`.

```text
ba-medical-store/
├── src/
│   ├── routes/                       # File-based routing TanStack Start
│   │   ├── __root.tsx                # Shell HTML, providers, head, error boundary
│   │   ├── index.tsx                 # Home
│   │   ├── catalogue.tsx             # Catalogue
│   │   ├── product.$slug.tsx         # Fiche produit
│   │   ├── categories.$slug.tsx
│   │   ├── brands.$slug.tsx
│   │   ├── search.tsx
│   │   ├── blog.tsx
│   │   ├── blog.$slug.tsx
│   │   ├── contact.tsx
│   │   ├── faq.tsx
│   │   ├── cart.tsx
│   │   ├── checkout.tsx
│   │   ├── auth.tsx                  # Login / signup / magic link
│   │   ├── reset-password.tsx        # Requis (flux Supabase)
│   │   ├── _authenticated.tsx        # Layout gate (redirige /auth)
│   │   ├── _authenticated/
│   │   │   ├── account.tsx
│   │   │   ├── orders.tsx
│   │   │   ├── orders.$id.tsx
│   │   │   ├── wishlist.tsx
│   │   │   ├── cabinet.tsx           # Medical Cabinet
│   │   │   ├── plus.tsx              # BA Medical+
│   │   │   ├── addresses.tsx
│   │   │   └── notifications.tsx
│   │   ├── _admin.tsx                # Layout gate RBAC (staff)
│   │   ├── _admin/
│   │   │   ├── dashboard.tsx
│   │   │   ├── catalog.tsx
│   │   │   ├── inventory.tsx
│   │   │   ├── orders.tsx
│   │   │   ├── crm.tsx
│   │   │   ├── marketing.tsx
│   │   │   ├── users.tsx
│   │   │   ├── logs.tsx
│   │   │   └── settings.tsx
│   │   ├── api/                      # Server Routes (HTTP)
│   │   │   └── public/               # Bypass auth publiée — webhooks/cron
│   │   │       ├── webhooks.stripe.ts
│   │   │       ├── webhooks.konnect.ts
│   │   │       └── cron.daily.ts
│   │   └── sitemap[.]xml.ts
│   │
│   ├── domains/                      # ⭐ Domaines métier (DDD) — cœur du projet
│   │   ├── catalog/
│   │   │   ├── components/           # ProductCard, VariantPicker…
│   │   │   ├── hooks/                # useProduct, useCatalogFilters
│   │   │   ├── queries/              # queryOptions (TanStack Query)
│   │   │   ├── functions/            # *.functions.ts (createServerFn)
│   │   │   ├── server/               # *.server.ts (helpers server-only)
│   │   │   ├── schemas/              # Zod validators
│   │   │   ├── events/               # émetteurs/consommateurs
│   │   │   ├── types.ts
│   │   │   └── README.md             # Doc du module (§12)
│   │   ├── commerce/                 # cart, checkout, coupons, payments, shipping, returns
│   │   ├── inventory/                # warehouses, stock, movements, suppliers, POs, batches
│   │   ├── customer/                 # auth wrappers, profile, wishlist, cabinet, plus, addresses
│   │   ├── crm/                      # leads, companies, notes, activities
│   │   ├── marketing/                # promotions, blog editor, email/whatsapp campaigns, landing
│   │   ├── ai/                       # assistant, smart search, recommendations, generators
│   │   ├── admin/                    # RBAC, users mgmt, logs, settings
│   │   └── public/                   # SEO, CMS pages, home, FAQ
│   │
│   ├── components/                   # UI transverse (Header, Footer, Nav, Layouts)
│   │   └── ui/                       # shadcn/ui (customisés via variants)
│   ├── hooks/                        # Hooks génériques (useDebounce, useMediaQuery, useHydrated…)
│   ├── providers/                    # QueryClientProvider, ThemeProvider, CartProvider, ToastProvider, I18nProvider
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── money.ts                  # Type Money = {amount:number, currency:'TND'|…}
│   │   ├── rbac.ts                   # requirePermission, hasRole helpers
│   │   ├── error-capture.ts          # (fourni par template) — NE PAS TOUCHER
│   │   ├── error-page.ts             # (fourni) — NE PAS TOUCHER
│   │   └── lovable-error-reporting.ts# (fourni) — NE PAS TOUCHER
│   ├── integrations/
│   │   └── supabase/                 # Généré par Lovable Cloud — NE PAS ÉDITER
│   │       ├── client.ts             # Browser client (publishable key)
│   │       ├── client.server.ts      # supabaseAdmin (service role, .server.ts)
│   │       ├── auth-middleware.ts    # requireSupabaseAuth (server fn middleware)
│   │       └── auth-attacher.ts      # attachSupabaseAuth (client middleware)
│   ├── config/
│   │   ├── env.ts                    # Zod parse import.meta.env.VITE_*
│   │   ├── features.ts               # Feature flags
│   │   └── routes.ts                 # Constantes chemins
│   ├── constants/
│   ├── assets/                       # Images importées ES6
│   ├── styles.css                    # Tailwind v4 + tokens oklch
│   ├── router.tsx                    # (fourni) — QueryClient, defaultPreloadStaleTime: 0
│   ├── start.ts                      # (fourni) — middlewares client (attachSupabaseAuth)
│   ├── server.ts                     # (fourni) — SSR wrapper — NE PAS SIMPLIFIER
│   └── routeTree.gen.ts              # AUTO-GÉNÉRÉ — NE PAS ÉDITER
│
├── supabase/
│   └── migrations/                   # SQL versionnées (Lovable Cloud)
│
├── docs/
│   ├── architecture/                 # Ce document + ADR
│   ├── modules/                      # 1 README par domaine
│   └── runbooks/                     # Incidents, restauration
│
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── vite.config.ts                    # tanstackStart.server.entry: "server"
├── package.json
└── tsconfig.json
```

**Règle d'or** : `src/domains/<A>` n'importe jamais `src/domains/<B>`. La communication passe par :
1. Events (Postgres outbox + consumers) — §7.
2. Types partagés dans `src/domains/<A>/types.ts` importés en lecture seule.
3. Vues DB dédiées (read-models).

---

## 4. Domaines métier (Bounded Contexts DDD)

```text
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Public     │    │   Customer   │    │   Commerce   │
│  SEO/CMS     │◄──►│ auth+profile │◄──►│ cart→order   │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Catalog    │◄──►│  Inventory   │    │     CRM      │
└──────┬───────┘    └──────┬───────┘    └──────────────┘
       ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Marketing   │    │      AI      │    │    Admin     │
└──────────────┘    └──────────────┘    └──────────────┘
```

| Domaine | Sous-modules | Responsabilité |
|---|---|---|
| **Public** | Home, Catalogue, Product, Search, Categories, Brands, Blog, Contact, FAQ | Rendu SSR/SEO, JSON-LD, sitemap |
| **Customer** | Auth, Profile, Orders (vues), Wishlist, Medical Cabinet, BA Medical+, Addresses, Notifications | Compte & données patient |
| **Commerce** | Cart, Checkout, Coupons, Payments, Shipping, Returns, Refunds | Cycle transactionnel |
| **Catalog** | Products, Categories, Brands, Attributes, Variants, Images, Documents | Fiche produit, taxonomie |
| **Inventory** | Warehouses, Stock, Stock Movements, Suppliers, POs, Expiration Dates, Batches | Stock multi-entrepôts |
| **CRM** | Customers, Leads, Companies, Notes, Activities | Pipeline B2B/B2C |
| **Marketing** | Promotions, Discounts, Email, WhatsApp, Blog édition, Landing Pages | Acquisition & rétention |
| **AI** | Assistant, Smart Search, Recommendations, Description Generator, SEO Generator | Couche IA (Lovable AI Gateway) |
| **Admin** | Dashboard, Users, Roles, Permissions, Logs, Settings | Back-office transverse |

---

## 5. RBAC — Rôles & Permissions

**Modèle imposé par la sécurité Lovable Cloud** : rôles dans une table dédiée `user_roles` (jamais sur `profiles`), résolution via fonction `SECURITY DEFINER` `has_role(_user_id, _role)`, policies RLS sur chaque table.

### 5.1 Rôles (enum `app_role`)

`super_admin`, `admin`, `commercial`, `stock_manager`, `marketing_manager`, `customer_support`, `b2b_customer`, `retail_customer` (+ `guest` = utilisateur non authentifié, hors table).

### 5.2 Permissions — 3 lignes de défense

1. **UI** — masquage conditionnel via `<Can permission="write:product" />`.
2. **Server Function** — middleware `requireSupabaseAuth` + `requirePermission()` dans `.handler()`.
3. **Postgres RLS** — policies alignées, dernière barrière.

### 5.3 Schéma canonique (extrait migration)

```sql
create type public.app_role as enum
  ('super_admin','admin','commercial','stock_manager',
   'marketing_manager','customer_support','b2b_customer','retail_customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
```

Chaque table métier utilisera `public.has_role(auth.uid(), 'admin')` (ou équivalent) dans ses policies.

---

## 6. Architecture Frontend

Le frontend suit la structure §3. Règles :

- **Server Components-like** : loaders TanStack + `useSuspenseQuery` par défaut. Pas de `useEffect` + `fetch`.
- **Data fetching canonique** :
  ```ts
  // domains/catalog/queries/product.ts
  export const productQuery = (slug: string) => queryOptions({
    queryKey: ['product', slug],
    queryFn: () => getProduct({ data: { slug } }),
  });
  ```
  ```tsx
  // routes/product.$slug.tsx
  export const Route = createFileRoute('/product/$slug')({
    loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(productQuery(params.slug)),
    component: () => {
      const { slug } = Route.useParams();
      const { data } = useSuspenseQuery(productQuery(slug));
      return <ProductView product={data} />;
    },
    head: ({ loaderData }) => ({ meta: buildProductMeta(loaderData) }),
    errorComponent: RouteError,
    notFoundComponent: RouteNotFound,
  });
  ```
- **Loaders auth-protégés** uniquement sous `_authenticated/` (le layout gate évite les 401 en SSR/prerender).
- **Aucune couleur hardcodée** (`bg-white`, `text-black`, `bg-[#...]` interdits). Tout passe par tokens sémantiques oklch dans `src/styles.css` et variants shadcn.
- **Suspense boundaries** systématiques.
- **i18n** : FR (défaut), AR (RTL), EN — `Intl` natif + dictionnaires typés.
- **Images** : `src/assets/*` avec imports ES6, ou Lovable Cloud Storage via URL signée pour user-uploads.

---

## 7. Architecture Backend

### 7.1 Trois surfaces serveur, trois usages

| Surface | Fichier | Utilisation |
|---|---|---|
| **Server Function** | `src/domains/**/functions/*.functions.ts` | Toute logique appelée depuis le client (RPC typé) |
| **Server Route** | `src/routes/api/public/*.ts` | Webhooks externes (Stripe, Konnect), cron, APIs publiques |
| **Server-only helper** | `src/domains/**/server/*.server.ts` | Modules privilégiés (supabaseAdmin) importés par les deux ci-dessus |

### 7.2 Trois clients Supabase — usage strict

| Client | Import | Quand |
|---|---|---|
| Browser | `@/integrations/supabase/client` | Auth flows, realtime, listeners — **client uniquement** |
| Middleware auth | `requireSupabaseAuth` | Server fn nécessitant l'utilisateur (RLS applique) |
| Admin | `supabaseAdmin` (via `.server.ts`, lazy `await import`) | Webhooks vérifiés, jobs, maintenance — bypass RLS |

**Interdictions absolues :**
- `supabaseAdmin` en top-level import dans un fichier route ou `*.functions.ts` → il fuiterait côté client.
- Server function sans middleware auth pour opérations privilégiées → endpoint public.
- `process.env.*` lu au top-level → **toujours** dans `.handler()`.

### 7.3 Layers (SOLID)

```text
Route / Server Route
   └─► Server Function (.functions.ts)
         └─► inputValidator (Zod)
               └─► requireSupabaseAuth + requirePermission
                     └─► Service (use-case) — orchestration métier pure
                           ├─► Repository (Supabase client typé) — I/O DB
                           ├─► Adapter (payments, notifier, ai)
                           └─► Event publisher → outbox (même tx)
```

- **S** un service = un use-case (`PlaceOrder`, `ReserveStock`, `RefundOrder`).
- **O** paiements = adapters (Konnect, Flouci, Stripe via Standard Connector) implémentant `PaymentProvider`.
- **L/I/D** repositories dépendent d'interfaces (`OrderReader`, `OrderWriter`).

### 7.4 Contrainte Cloudflare Workers

- **Autorisés** : fetch, crypto Web, Buffer (via nodejs_compat), timers.
- **Interdits** : `child_process`, `sharp`, `puppeteer`, `fs.watch`, packages Node-only.
- **Longs traitements** → délégués à Postgres (pg_cron) ou webhook async, jamais bloquants dans une request Worker.

---

## 8. Architecture Database (Lovable Cloud / Postgres)

### 8.1 Domaines & tables

| Domaine | Tables |
|---|---|
| Identity | `profiles`, `user_roles` |
| Catalog | `products`, `product_variants`, `product_images`, `product_documents`, `categories`, `brands`, `attributes`, `attribute_values`, `variant_attributes` |
| Inventory | `warehouses`, `stock_items`, `stock_movements`, `batches`, `suppliers`, `purchase_orders`, `po_lines` |
| Commerce | `carts`, `cart_items`, `orders`, `order_items`, `order_status_history`, `payments`, `invoices`, `shipments`, `returns`, `refunds`, `coupons`, `coupon_redemptions` |
| Customer | `addresses`, `wishlists`, `wishlist_items`, `medical_cabinets`, `subscriptions` |
| CRM | `companies`, `contacts`, `leads`, `notes`, `activities` |
| Marketing | `promotions`, `discounts`, `campaigns`, `blog_posts`, `blog_categories`, `landing_pages`, `email_logs`, `whatsapp_logs` |
| Reviews | `reviews`, `review_media`, `review_votes` |
| Support | `tickets`, `ticket_messages` |
| System | `notifications`, `audit_logs`, `settings`, `media`, `feature_flags`, `event_outbox` |

### 8.2 Conventions non négociables

- snake_case tables + colonnes, PK `uuid default gen_random_uuid()`.
- `created_at`, `updated_at` (triggers), `deleted_at` (soft-delete) sur entités auditées.
- **Chaque `CREATE TABLE public.*` suivi immédiatement de `GRANT`** (patch Data API Lovable Cloud) — sinon `permission denied` à l'exécution.
- **RLS ACTIVÉE** sur toutes les tables publiques + policies par rôle via `has_role()`.
- Roles séparés en table (`user_roles`) — jamais sur `profiles`.
- Index sur toutes FK + colonnes de filtre chaudes.
- Full-text : `tsvector` généré + index GIN. Similarité fuzzy : `pg_trgm`. Vecteurs : `pgvector` (HNSW).
- Extensions : `pgcrypto`, `pg_trgm`, `pgvector`, `pg_cron`, `pg_stat_statements`.

### 8.3 Trigger auto-profile (obligatoire si profils utilisés)

`auth.users` → trigger `on_auth_user_created` → insert dans `profiles`.

---

## 9. Architecture événementielle

### 9.1 Bus retenu (Lovable-compatible)

**Outbox Postgres + pg_cron + Server Route webhook**. Zéro dépendance externe.

```text
[Server Function] --tx--> [table event_outbox]
                                  │
                          pg_cron (every 1min)
                                  ▼
              POST /api/public/cron.dispatch-events (signed)
                                  │
                       ┌──────────┼──────────┐
                       ▼          ▼          ▼
                    Email      WhatsApp    Search index
                   (Lovable)   connector   (pgvector/tsv)
```

- Écriture métier + insert `event_outbox` dans **la même transaction** → livraison at-least-once.
- Consommateurs **idempotents** (dédup sur `event.id`).
- Migration future vers un broker dédié = swap du dispatcher, aucun impact métier.

### 9.2 Événements v1

| Event | Émetteur | Consommateurs |
|---|---|---|
| `customer.registered` | Customer | Email welcome, CRM |
| `order.created` | Commerce | Email, WhatsApp, CRM, AI |
| `order.paid` | Commerce | Inventory (final deduct), Invoicing, Email |
| `order.shipped` | Commerce | Email, WhatsApp, CRM |
| `order.delivered` | Commerce | Reviews invite |
| `order.refunded` | Commerce | Inventory, Finance |
| `stock.updated` | Inventory | Search reindex |
| `stock.low` | Inventory | Admin alert, Auto-PO draft |
| `product.published` | Catalog | Search, Sitemap tag revalidate |
| `subscription.renewed` | Customer (BA+) | Billing, Email |
| `review.published` | Reviews | Product rating recompute |
| `cart.abandoned` | Commerce | Marketing relance |

Schéma type `{ id, name, version, occurredAt, actor, payload, correlationId? }`.

---

## 10. Transverses

### 10.1 Performance

- SSR streaming + Suspense.
- **TanStack Query** : `defaultPreloadStaleTime: 0`, cache par tag.
- Invalidation via events (`revalidate` de `queryClient` déclenché après action).
- **Pagination cursor-based** systématique.
- Images : `src/assets` + import ES6 (build-optimisées) ; user uploads via Cloud Storage.
- Recherche : Postgres FTS + trigram v1 ; migration vers moteur dédié = adapter `SearchProvider`.
- Budget : LCP < 2.0s (4G TN), CLS < 0.05, TTFB < 400ms edge.

### 10.2 Sécurité (OWASP)

| Contrôle | Mesure |
|---|---|
| Access control | RBAC 3 couches + RLS |
| Crypto | TLS géré Lovable, `pgcrypto` sur colonnes PII médicales |
| Injection | Client Supabase paramétré + Zod strict |
| Auth | Lovable Cloud Auth + MFA staff |
| Webhooks | Vérif signature HMAC dans `/api/public/webhooks.*` |
| Rate limit | Middleware server fn + colonne `rate_limits` (fenêtre glissante) |
| Audit | `audit_logs` append-only, hash chain |
| Secrets | `LOVABLE_API_KEY` auto-provisionné ; jamais côté client ; jamais `VITE_*` |
| PII santé | `medical_cabinets` chiffré colonne + accès loggé + rétention |

### 10.3 Observabilité

- SSR errors capturés par `src/server.ts` (wrapper Lovable) + `error-capture.ts`.
- Erreurs React → `errorComponent` root + `reportLovableError`.
- Logs consultables via Lovable Runtime Errors.

### 10.4 SEO

- `head()` par route (titre + description unique, jamais les défauts).
- `og:image` uniquement sur routes feuille avec image métier (produit, article).
- `sitemap[.]xml.ts` (server route) + `robots.txt`.
- JSON-LD Product / BreadcrumbList / Organization dans les fiches produit.

### 10.5 IA (Lovable AI Gateway)

Toujours via `LOVABLE_API_KEY` lu **dans le handler d'une server fn**. Cas d'usage :
- Description produit (fallback génération).
- SEO meta generator.
- Assistant recherche sémantique (embeddings `pgvector` + reranking).
- Recommandations (similarité vectorielle).

---

## 11. Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composants React | PascalCase | `ProductCard.tsx` |
| Hooks | `useX.ts` camelCase | `useCartTotals.ts` |
| Server Functions | `verb.functions.ts` | `placeOrder.functions.ts` |
| Server-only helpers | `X.server.ts` | `pricing.server.ts` |
| Services | PascalCase + `Service` | `PlaceOrderService.ts` |
| Repositories | PascalCase + `Repository` | `OrderRepository.ts` |
| Query options | `xQuery` | `productQuery` |
| Events | `<domain>.<verbe_passé>` | `order.created` |
| Tables SQL | snake_case pluriel | `order_items` |
| Colonnes SQL | snake_case | `created_at` |
| Routes URL | kebab-case | `/medical-cabinet` |
| Env server | SCREAMING_SNAKE | `KONNECT_SECRET` |
| Env client | `VITE_...` | `VITE_APP_NAME` |

---

## 12. Documentation par module

Chaque `src/domains/<domain>/README.md` suit :

```markdown
# <Domain>
## Objectif
## Responsabilités
## Dépendances (packages, autres domaines via events uniquement, services externes)
## API exposée (server functions, events publiés)
## API consommée (events souscrits, services)
## Permissions RBAC
## Modèle de données (tables, index, RLS)
## Risques & mitigations
## Tests requis
## Évolutions futures
## ADR liés
```

---

## 13. ADR à produire

- **ADR-0001** — Stack Lovable-native (TanStack Start, pas Next.js).
- **ADR-0002** — Mono-app + domaines dans `src/domains/*` (pas de monorepo).
- **ADR-0003** — Auth = Lovable Cloud (pas Clerk).
- **ADR-0004** — Storage = Lovable Cloud Storage (pas Cloudinary).
- **ADR-0005** — Bus événementiel = outbox Postgres + pg_cron (pas Redis/BullMQ).
- **ADR-0006** — Recherche v1 = Postgres FTS + `pg_trgm` + `pgvector` ; adapter pour migration.
- **ADR-0007** — Multi-warehouse dès jour 1 (`stock_items.warehouse_id`).
- **ADR-0008** — Paiements TN = Konnect + Flouci via Server Route webhooks ; Stripe via Standard Connector international.
- **ADR-0009** — RBAC = table `user_roles` + `has_role()` (jamais sur `profiles`).
- **ADR-0010** — RLS partout, defense in depth.
- **ADR-0011** — Aucune dépendance Node-only (contrainte Cloudflare Workers).

---

## 14. Points d'extension (10 ans)

| Besoin futur | Extension prévue |
|---|---|
| Marketplace multi-fournisseurs | `suppliers` + `product_supplier` + POs par fournisseur dès v1 |
| Multi-entrepôts | `warehouses` + `stock_items(warehouse_id)` dès v1 |
| Multi-devises | `money = {amount, currency}` — jamais `float` seul |
| Multi-pays | `addresses.country`, `tax_rules` par juridiction |
| App mobile | Server functions réutilisables via un client TanStack Query mobile |
| B2B avancé | `companies`, `credit_terms`, `quotes` déjà prévus |
| Téléconsultation | Nouveau bounded context, consomme events `customer.*` |
| Moteur de recherche dédié | Swap adapter `SearchProvider` (Meilisearch/Typesense) |
| Broker événements | Swap dispatcher outbox → NATS/Kafka sans toucher aux domaines |
| Nouveau LLM | Nouveau adapter dans `domains/ai/` — `LOVABLE_API_KEY` unifié |

---

## 15. Livrables & suite

**Ce document livre :**
1. Architecture complète (100% Lovable-native). ✔
2. Structure des dossiers. ✔
3. 9 domaines métier. ✔
4. Conventions nommage. ✔
5. Dépendances inter-modules (events + types uniquement). ✔
6. Flux de données (§7.3, §9). ✔
7. Points d'extension. ✔
8. ADR justifiés. ✔

**Prochaines étapes par agent spécialisé :**
- **Database Agent** — migrations SQL Lovable Cloud (tables + `GRANT` + RLS + `has_role` + triggers + outbox + pg_cron).
- **Backend Agent** — server functions par domaine, services, repositories, dispatcher outbox.
- **Frontend Agent** — design system (tokens oklch + variants shadcn), routes, features.
- **AI Agent** — pipelines embeddings + prompts via Lovable AI Gateway.
- **QA Agent** — pyramide de tests (unit + e2e Playwright).
- **Security Agent** — threat model par module, scan CI, revue RLS.
- **SEO Agent** — head() par route, sitemap dynamique, JSON-LD, hreflang.
- **DevOps Agent** — CI GitHub Actions, backups Lovable Cloud, runbooks.

**Contrainte partagée à tous les agents** : ne jamais introduire de dépendance hors stack Lovable-native (§2). Toute exception passe par un nouvel ADR.
