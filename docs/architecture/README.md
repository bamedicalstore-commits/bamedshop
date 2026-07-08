# BA Medical Store — Enterprise Architecture (v1.0)

> Document de référence officiel pour tous les agents : Frontend, Backend, Database, QA, Security, SEO, AI, DevOps.
> Auteur : Chief Software Architect. Statut : approuvé pour implémentation.

---

## 1. Vision & Principes directeurs

BA Medical Store est une plateforme e-commerce tunisienne de matériel médical, destinée aux particuliers et aux professionnels de santé (médecins, infirmiers, kinés, cliniques, entreprises). Lancement avec le catalogue **Pharmatec Tunisie**, puis extension multi-fournisseurs / multi-marques / multi-entrepôts.

**Horizon : 10 ans sans refonte majeure.** Chaque décision est arbitrée selon 5 axes :

| Axe | Traduction concrète |
|---|---|
| Maintenabilité | Code lisible, modules < 500 LOC, 1 responsabilité par module |
| Scalabilité | Découplage domaines, files d'événements, cache multi-niveaux |
| Performance | SSR + RSC, cache CDN, images optimisées, DB indexée |
| Sécurité | OWASP Top 10, RBAC, validation Zod partout, audit logs |
| Réutilisabilité | Packages partagés, design system, contrats typés |

**Paradigmes retenus :**
- **Domain-Driven Design (DDD)** — un module = un bounded context métier.
- **Clean Architecture** — dépendances toujours vers l'intérieur (domain ← application ← infrastructure).
- **Event-Driven** — les domaines communiquent par événements, pas par appels directs.
- **CQRS léger** — séparation lecture (queries) / écriture (commands) là où le trafic le justifie (catalogue, recherche).
- **SOLID** partout côté backend.

---

## 2. Stack technique

| Couche | Technologie | Justification |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC, streaming SSR, Server Actions, edge-ready |
| UI | React 19 + TypeScript strict | Typage bout-en-bout |
| Styling | Tailwind CSS + shadcn/ui | Design system contrôlable, tokens sémantiques |
| ORM | Prisma | Migrations, typage, DX |
| DB | PostgreSQL 16 | Transactions, JSONB, full-text, extensions (pg_trgm, pgvector) |
| Auth | Supabase Auth (recommandé) | RLS, OAuth, magic link, intégration PG native |
| Storage | Cloudinary | Transformations, CDN, DAM |
| Search | Meilisearch (self-hosted ou cloud) | Latence < 50ms, typo-tolerance, facets |
| Cache | Redis (Upstash) | Sessions, rate-limit, cache applicatif |
| Queue | BullMQ (Redis) | Jobs asynchrones, retries, cron |
| Email | Resend + React Email | Templates typés |
| WhatsApp | Meta Cloud API | Notifications transactionnelles |
| Paiements | Konnect / Flouci (TN) + Stripe (int'l) | Marché local + fallback carte |
| Observabilité | Sentry + OpenTelemetry + Vercel Analytics | Erreurs, traces, RUM |
| Deploy | Vercel (front) + Railway/Fly (workers) + Supabase (DB) | Edge + long-running |

**Choix Auth : Supabase Auth** (vs Clerk) — RLS natif Postgres, coût prévisible, ownership des données utilisateurs (souveraineté TN).

---

## 3. Architecture du monorepo

```text
ba-medical-store/
├── apps/
│   ├── web/                    # Next.js 15 — storefront + admin
│   └── workers/                # Node workers (queues, cron, webhooks lourds)
├── packages/
│   ├── ui/                     # Design system shadcn étendu (composants partagés)
│   ├── db/                     # Prisma schema, migrations, seed
│   ├── domain/                 # Entités métier pures (aucune I/O)
│   ├── contracts/              # Zod schemas + types partagés (DTO, events)
│   ├── events/                 # Bus d'événements, définitions typées
│   ├── auth/                   # Wrapper Supabase + RBAC + guards
│   ├── mailer/                 # Templates React Email
│   ├── notifier/               # Email + WhatsApp + Push (adapter pattern)
│   ├── search/                 # Client Meilisearch typé
│   ├── payments/               # Adapters Konnect / Flouci / Stripe
│   ├── storage/                # Wrapper Cloudinary + signatures
│   ├── ai/                     # Assistants, embeddings, generation
│   ├── config/                 # ESLint, TS, Tailwind, Prettier partagés
│   └── utils/                  # Helpers purs (money, i18n, dates)
├── database/
│   ├── migrations/             # SQL versionnées (Prisma migrate)
│   ├── seeds/                  # Données de démo par environnement
│   └── policies/               # Politiques RLS Supabase
├── docs/
│   ├── architecture/           # Ce document + ADR
│   ├── modules/                # 1 doc par module (voir §11)
│   ├── api/                    # OpenAPI/tRPC dumps
│   └── runbooks/               # Ops (incidents, restauration, migrations)
├── scripts/                    # CLI outillage (import Pharmatec, backfills)
├── tests/
│   ├── e2e/                    # Playwright
│   ├── integration/            # Vitest + testcontainers
│   └── load/                   # k6
└── .github/
    └── workflows/              # CI, CD, sécurité, dépendances
```

**Gestionnaire :** pnpm workspaces + Turborepo (cache CI, tâches parallèles).

**Règle d'or :** aucune app n'importe une autre app. Toute logique partagée passe par `packages/*`.

---

## 4. Domaines métier (Bounded Contexts)

Chaque domaine est **indépendant** : schéma DB isolé (schéma Postgres logique ou préfixe table), events sortants publiés, events entrants consommés. Aucun `import` cross-domain hors `contracts` et `events`.

### 4.1 Cartographie

```text
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Public     │    │   Customer   │    │   Commerce   │
│  (SEO/CMS)   │◄──►│ (auth,prof.) │◄──►│ (cart→order) │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Catalog    │◄──►│  Inventory   │    │     CRM      │
│ (products…)  │    │ (stock,WH)   │    │ (leads,accts)│
└──────┬───────┘    └──────┬───────┘    └──────────────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Marketing   │    │      AI      │    │Administration│
│ (promo,blog) │    │ (search,rec) │    │ (RBAC, logs) │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 4.2 Liste et responsabilités

| Domaine | Sous-modules | Responsabilité principale |
|---|---|---|
| **Public** | Home, Catalogue, Product, Search, Categories, Brands, Blog, Contact, FAQ | Rendu SEO, pages publiques, JSON-LD |
| **Customer** | Auth, Profile, Orders (vue), Wishlist, Medical Cabinet, BA Medical+, Addresses, Notifications | Compte utilisateur & profils métier |
| **Commerce** | Cart, Checkout, Coupons, Payments, Shipping, Returns, Refunds | Cycle transactionnel |
| **Catalog** | Products, Categories, Brands, Attributes, Variants, Images, Documents | Fiche produit, taxonomie |
| **Inventory** | Warehouses, Stock, Stock Movements, Suppliers, POs, Expiration Dates, Batches | Stock physique multi-entrepôts |
| **CRM** | Customers, Leads, Companies, Notes, Activities | Relation B2B/B2C, pipeline |
| **Marketing** | Promotions, Discounts, Email, WhatsApp, Blog (édition), Landing Pages | Acquisition, rétention |
| **AI** | Assistant, Smart Search, Recommendations, Description Generator, SEO Generator | Couche intelligence |
| **Administration** | Dashboard, Users, Roles, Permissions, Logs, Settings | Back-office transverse |

### 4.3 Règles d'interaction

- **Communication synchrone** (RPC interne) : autorisée uniquement dans le même domaine.
- **Communication asynchrone** (events) : obligatoire entre domaines. Voir §7.
- **Lecture cross-domaine** : passe par une **vue matérialisée** ou un **read-model** dédié (ex. `commerce_orders_view` lit `catalog.products` par snapshot au moment de la commande).

---

## 5. RBAC — Rôles & Permissions

Modèle : **Role-Based Access Control** avec permissions granulaires (verbe:ressource:scope).

### 5.1 Rôles

| Rôle | Scope | Exemples de droits |
|---|---|---|
| Super Admin | Tout | `*:*:*` |
| Admin | Op. business | Users (sauf super admins), settings, all reads |
| Commercial | Commerce + CRM | Orders CRUD, customers CRUD, quotes |
| Stock Manager | Inventory | Warehouses, stock, POs, batches |
| Marketing Manager | Marketing + Catalog light | Promo, blog, landing pages, product SEO |
| Customer Support | Read + refunds/tickets | Orders read, refunds init, tickets |
| B2B Customer | Self + company | Company orders, quotes, credit terms |
| Retail Customer | Self | Own profile, orders, wishlist |
| Guest | Public | Read public, cart local |

### 5.2 Format permission

`<action>:<resource>:<scope>` — ex : `read:order:own`, `write:product:*`, `refund:order:assigned`.

Table `permissions` + `role_permissions` (many-to-many). Résolution en middleware Next + policies RLS Postgres (defense in depth).

### 5.3 Enforcement à 3 niveaux

1. **UI** — masquage conditionnel (`<Can I="write" a="Product">`).
2. **Server Action / API** — guard `requirePermission()` sur chaque handler.
3. **Database** — Row Level Security Supabase (empêche bypass applicatif).

---

## 6. Architecture Frontend

```text
apps/web/src/
├── app/                        # App Router (routes)
│   ├── (public)/               # Groupe : layout public
│   │   ├── page.tsx            # Home
│   │   ├── catalogue/
│   │   ├── product/[slug]/
│   │   ├── categories/[slug]/
│   │   ├── brands/[slug]/
│   │   ├── blog/
│   │   ├── contact/
│   │   └── faq/
│   ├── (customer)/             # Groupe : auth requise
│   │   ├── account/
│   │   ├── orders/
│   │   ├── wishlist/
│   │   ├── cabinet/            # Medical Cabinet
│   │   ├── plus/               # BA Medical+
│   │   └── addresses/
│   ├── (checkout)/
│   │   ├── cart/
│   │   └── checkout/
│   ├── (admin)/                # Guard RBAC
│   │   ├── dashboard/
│   │   ├── catalog/
│   │   ├── inventory/
│   │   ├── orders/
│   │   ├── crm/
│   │   ├── marketing/
│   │   └── settings/
│   ├── api/                    # Route handlers (webhooks, uploads signés)
│   └── layout.tsx              # Root
├── components/                 # Composants UI transverses (Header, Footer, Nav)
├── features/                   # 1 dossier par domaine (voir §4)
│   ├── catalog/
│   │   ├── components/         # ProductCard, ProductGallery, VariantPicker
│   │   ├── hooks/              # useProduct, useVariants
│   │   ├── actions/            # Server Actions
│   │   ├── queries/            # DAL server (cache: 'force-cache' | tags)
│   │   ├── schemas/            # Zod validators
│   │   └── types.ts
│   ├── commerce/
│   ├── inventory/
│   ├── crm/
│   ├── customer/
│   ├── marketing/
│   ├── ai/
│   └── admin/
├── hooks/                      # Hooks génériques (useDebounce, useMediaQuery)
├── services/                   # Clients HTTP (search, ai, payments)
├── providers/                  # Context (Cart, Auth, Theme, Toast, i18n)
├── types/                      # Types transverses
├── utils/                      # Purs (formatPrice, slugify)
├── config/                     # env parsing (Zod), feature flags
├── constants/                  # Enums UI, routes
└── assets/                     # SVG, fonts, images statiques
```

**Règles :**
- `features/*` ne s'importent pas entre eux → passer par `packages/contracts` ou events.
- Composants dans `components/` = purement présentationnels, sans data-fetching.
- Data-fetching = Server Components + Server Actions par défaut. Client Components uniquement pour interactivité (formulaires, panier optimiste).
- Suspense boundaries systématiques autour des sections lentes.
- **Aucune couleur hardcodée** — uniquement tokens Tailwind sémantiques.

---

## 7. Architecture Backend

```text
apps/web/src/server/  (+ apps/workers/)
├── api/                # Route handlers (webhooks, public REST)
├── actions/            # Server Actions Next (par feature, mais logique déléguée à services)
├── services/           # Use-cases (orchestration métier) — SOLID
│   ├── catalog/
│   ├── commerce/
│   ├── inventory/
│   └── ...
├── repositories/       # Accès DB (Prisma) — 1 par agrégat
├── validators/         # Zod schemas (req/res)
├── middlewares/        # auth, rbac, rate-limit, i18n, tracing
├── events/             # Publishers + subscribers
├── jobs/               # BullMQ processors (long tasks)
├── emails/             # React Email templates + senders
└── notifications/      # WhatsApp, push, in-app
```

### 7.1 Flow d'une écriture (ex : passer commande)

```text
Client (RSC form)
  └─► Server Action `placeOrder`
        └─► validator Zod
              └─► service `commerce/PlaceOrderService`
                    ├─► repository `orders` (Prisma tx)
                    ├─► repository `inventory` (reserve stock)
                    ├─► adapter `payments` (init)
                    └─► publish event `order.created`
                          └─► subscribers (async, via queue)
                                ├─► notifier (email + WhatsApp)
                                ├─► CRM (log activity)
                                ├─► AI (recommandations post-achat)
                                └─► audit log
```

### 7.2 Application des principes SOLID

- **S** — un service = un use-case (`PlaceOrder`, `RefundOrder`, `ReserveStock`).
- **O** — nouveaux moyens de paiement = nouvel adapter, pas de modification core.
- **L** — tous les adapters paiement respectent `PaymentProvider` interface.
- **I** — interfaces fines (`StockReader`, `StockWriter` séparés).
- **D** — services dépendent d'interfaces (ports), pas de Prisma directement.

---

## 8. Architecture Database

### 8.1 Domaines & tables (aperçu)

| Domaine | Tables principales |
|---|---|
| Identity | `users`, `user_roles`, `roles`, `permissions`, `role_permissions`, `sessions` |
| Catalog | `products`, `product_variants`, `product_images`, `product_documents`, `categories`, `category_tree`, `brands`, `attributes`, `attribute_values`, `variant_attributes` |
| Inventory | `warehouses`, `stock_items`, `stock_movements`, `batches`, `expiration_dates`, `suppliers`, `purchase_orders`, `po_lines` |
| Commerce | `carts`, `cart_items`, `orders`, `order_items`, `order_status_history`, `payments`, `invoices`, `shipments`, `returns`, `refunds`, `coupons`, `coupon_redemptions` |
| Customer | `profiles`, `addresses`, `wishlists`, `wishlist_items`, `medical_cabinets`, `subscriptions` (BA Medical+) |
| CRM | `customers` (extension pro), `leads`, `companies`, `contacts`, `notes`, `activities` |
| Marketing | `promotions`, `discounts`, `campaigns`, `blog_posts`, `blog_categories`, `landing_pages`, `email_logs`, `whatsapp_logs` |
| Reviews | `reviews`, `review_media`, `review_votes` |
| Support | `tickets`, `ticket_messages` |
| System | `notifications`, `audit_logs`, `settings`, `media`, `feature_flags`, `event_outbox` |

### 8.2 Conventions

- Snake_case tables & colonnes.
- PK : `id uuid default gen_random_uuid()`.
- FK : `on delete restrict` par défaut, `cascade` uniquement pour propriétés (ex : `order_items → orders`).
- Timestamps `created_at`, `updated_at`, `deleted_at` (soft-delete pour entités auditées).
- **RLS activée sur toutes les tables `public.*`** — policies alignées sur RBAC.
- **Grants explicites** (`GRANT ... TO authenticated / service_role`) à chaque migration.
- Index : sur toutes FK, colonnes de filtre fréquentes, GIN sur `tsvector` search, HNSW sur embeddings.
- Extensions : `pg_trgm`, `pgcrypto`, `pgvector`, `pg_stat_statements`.

### 8.3 Event outbox pattern

Table `event_outbox` remplie dans la même transaction que l'écriture métier → worker publie vers le bus. Garantit **at-least-once** sans XA.

---

## 9. Architecture événementielle

### 9.1 Bus

Court terme : **BullMQ (Redis)** + `event_outbox` Postgres.
Long terme : migration transparente vers **NATS JetStream** ou **Kafka** (l'abstraction `packages/events` isole le producer/consumer).

### 9.2 Contrats d'événements

```ts
// packages/events/src/definitions.ts
type DomainEvent<TName extends string, TPayload> = {
  id: string;          // uuid
  name: TName;         // "order.created"
  version: 1;
  occurredAt: string;  // ISO
  actor: { type: 'user'|'system'; id: string };
  payload: TPayload;
  correlationId?: string;
};
```

### 9.3 Événements v1 (extrait)

| Événement | Émetteur | Consommateurs |
|---|---|---|
| `customer.registered` | Customer | Notifier (welcome), CRM, Marketing |
| `order.created` | Commerce | Notifier, CRM, AI, Analytics |
| `order.paid` | Commerce | Inventory (deduct final), Notifier, Invoicing |
| `order.shipped` | Commerce | Notifier, CRM |
| `order.delivered` | Commerce | Reviews (invite), CRM |
| `order.refunded` | Commerce | Inventory, Notifier, Finance |
| `stock.updated` | Inventory | Catalog cache, Search index |
| `stock.low` | Inventory | Admin alert, Auto-PO |
| `product.published` | Catalog | Search, Sitemap, Social |
| `subscription.renewed` | Customer (BA+) | Billing, Notifier |
| `review.published` | Reviews | Product rating recompute, Notifier |
| `cart.abandoned` | Commerce | Marketing (relance) |

Chaque consommateur est **idempotent** (dédup via `event.id`).

---

## 10. Transverses

### 10.1 Performance

- **Server Components par défaut**, `use client` uniquement quand nécessaire.
- **Streaming SSR** + Suspense.
- **Cache Next**: `revalidateTag('product:'+id)` invalidé sur events `product.updated`.
- **Edge runtime** pour pages catalogue + product.
- **CDN Cloudinary** transformations à la volée (`f_auto,q_auto`).
- **Pagination cursor-based** (pas d'`offset` sur listes longues).
- **Recherche indexée** Meilisearch + fallback SQL `pg_trgm`.
- **HTTP caching** : `Cache-Control: s-maxage=..., stale-while-revalidate`.
- Budget perf : LCP < 2.0s (4G), CLS < 0.05, TTFB < 400ms.

### 10.2 Sécurité (OWASP-aligned)

| Contrôle | Mesure |
|---|---|
| A01 Broken Access | RBAC 3-niveaux (UI + Server + RLS) |
| A02 Cryptographic | TLS 1.3, secrets vault (Doppler/Vercel), bcrypt via Supabase, `pgcrypto` colonnes PII |
| A03 Injection | Prisma param., Zod strict, jamais de SQL brut sans `Prisma.sql` |
| A04 Insecure Design | Threat model par module (§11) |
| A05 Misconfig | CSP stricte, HSTS, no `X-Powered-By`, headers via `next.config` |
| A07 Auth | Supabase + MFA obligatoire staff |
| A08 Integrity | Vérif signatures webhooks (Konnect/Stripe), Subresource Integrity |
| A09 Logging | Audit logs immutables (`audit_logs` append-only + hash chain) |
| A10 SSRF | Whitelist domaines pour fetch serveur |
| Rate limit | Upstash Ratelimit — 60 req/min public, 10 req/min auth mutations |

Données santé/patient (Medical Cabinet) : **chiffrement colonne** + accès loggé + politique de rétention.

### 10.3 Observabilité

- Sentry (front + back).
- OpenTelemetry → traces vers Grafana Tempo.
- Logs structurés JSON (`pino`) → Better Stack.
- SLO : dispo 99.9%, p95 API < 300ms.

### 10.4 i18n

- FR (défaut), AR (RTL), EN.
- `next-intl`, clés typées, extraction automatisée.
- Prix en TND, formats via `Intl`.

---

## 11. Documentation par module (template)

Chaque module dans `docs/modules/<domain>/<module>.md` suit ce canevas :

```markdown
# <Module>
## Objectif
## Responsabilités
## Dépendances (packages, autres modules, services externes)
## API exposée (Server Actions, endpoints, events publiés)
## API consommée (events souscrits, services appelés)
## Permissions RBAC
## Modèle de données (tables, index clés)
## Risques (sécurité, perf, métier) & mitigations
## Tests (unit / integration / e2e requis)
## Évolutions futures (roadmap 12–36 mois)
## ADR liés
```

---

## 12. Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers React | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase, préfixe `use` | `useCartTotals.ts` |
| Server Actions | verbe camelCase | `placeOrder.ts` |
| Services | PascalCase suffixe `Service` | `PlaceOrderService.ts` |
| Repositories | PascalCase suffixe `Repository` | `OrderRepository.ts` |
| Events | `<domain>.<verbe_passé>` | `order.created` |
| Tables SQL | snake_case pluriel | `order_items` |
| Colonnes SQL | snake_case | `created_at` |
| Env vars | SCREAMING_SNAKE | `DATABASE_URL` |
| Routes URL | kebab-case | `/medical-cabinet` |
| Branches Git | `type/scope-desc` | `feat/catalog-variants` |
| Commits | Conventional Commits | `feat(catalog): add variants` |

---

## 13. Architecture Decision Records (ADR)

Format léger dans `docs/architecture/adr/NNNN-titre.md`. ADR initiaux à produire :

- ADR-0001 : Choix Next.js 15 App Router
- ADR-0002 : Monorepo pnpm + Turborepo
- ADR-0003 : Supabase vs Clerk → Supabase
- ADR-0004 : Event Outbox + BullMQ (phase 1)
- ADR-0005 : Meilisearch pour la recherche
- ADR-0006 : Multi-warehouse dès le schéma initial (même si 1 WH au lancement)
- ADR-0007 : RLS Postgres comme dernière ligne de défense
- ADR-0008 : Konnect + Flouci pour paiement local TN

---

## 14. Points d'extension prévus (10 ans)

| Besoin futur | Mécanisme d'extension déjà en place |
|---|---|
| Multi-fournisseurs marketplace | `suppliers` + `product_supplier` déjà modélisé, POs par supplier |
| Multi-entrepôts | `warehouses` + `stock_items(warehouse_id)` dès jour 1 |
| Multi-devises | `money` = `{amount, currency}`, jamais un `float` seul |
| Multi-pays | `addresses.country`, taxes par juridiction (`tax_rules`) |
| App mobile | Backend = Server Actions + REST public → réutilisable via RN |
| Marketplace B2B | `companies`, `credit_terms`, `quotes` déjà prévus dans CRM |
| Téléconsultation | Nouveau bounded context, consomme `customer.*` events |
| IA générative avancée | `packages/ai` isolé, changement de provider = 1 adapter |
| Migration bus événementiel | Interface `EventBus` — Redis → NATS/Kafka sans refactor métier |

---

## 15. Livrables & prochaines étapes

**Ce document livre :**
1. Architecture complète ✔
2. Structure des dossiers (monorepo + apps + packages) ✔
3. Domaines métier (9 bounded contexts) ✔
4. Conventions de nommage ✔
5. Dépendances inter-modules (via contracts + events uniquement) ✔
6. Flux de données (§7.1, §9) ✔
7. Points d'extension (§14) ✔
8. Décisions justifiées (§13 ADR) ✔

**À produire ensuite par les agents spécialisés :**
- **Database Agent** — schéma Prisma complet + migrations + RLS policies + seeds.
- **Backend Agent** — services par domaine, repositories, event bus.
- **Frontend Agent** — design system étendu, features UI par domaine.
- **AI Agent** — pipelines embeddings, prompts, guardrails.
- **QA Agent** — pyramide de tests par module.
- **Security Agent** — threat models, scan CI, rotation secrets.
- **SEO Agent** — sitemap, JSON-LD, hreflang, Core Web Vitals.
- **DevOps Agent** — pipelines CI/CD, IaC, backups, runbooks.

Chaque agent doit lire ce document AVANT toute implémentation et référencer les ADR pour justifier ses choix.
