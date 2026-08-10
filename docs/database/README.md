# BA Medical Store — Database Architect v1.0

Référence officielle pour toute la couche données de BA Medical Store.
Ce document définit **le schéma cible**, ses relations, ses contraintes,
sa stratégie de migration et les décisions d'architecture (ADR).

> Aucune logique métier n'est implémentée à ce stade — uniquement la
> conception du modèle de données.

---

## 0. Contexte technique — Lovable Cloud (Supabase / PostgreSQL)

La stack Lovable impose **PostgreSQL managé via Lovable Cloud (Supabase)**.
Nous n'utilisons donc **pas Prisma en production** : l'ORM n'est pas la
source de vérité — le sont les **migrations SQL versionnées** appliquées
par Lovable Cloud, avec **Row Level Security (RLS)** systématique.

Pour la lisibilité et parce que le brief demande un « schéma Prisma », ce
document fournit **deux représentations équivalentes** :

1. **Schéma canonique SQL/PostgreSQL** — `docs/database/schema.sql`
   (source de vérité, appliqué en migrations).
2. **Schéma Prisma de référence** — `docs/database/schema.prisma`
   (documentation seulement, pour équipes habituées à Prisma).

Toute divergence future doit être résolue en faveur du SQL.

---

## 1. Principes directeurs

| Principe                       | Application                                                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sécurité par défaut**        | RLS activé sur toutes les tables `public.*`. Rôles applicatifs (`anon`, `authenticated`, `service_role`) + rôles métier (`admin`, `staff`, `b2b`, `customer`) via table `user_roles`. **Jamais** de rôle stocké sur `profiles`. |
| **Traçabilité totale**         | `created_at`, `updated_at`, `deleted_at` (soft delete) sur toutes les tables métier. Table `audit_logs` immuable pour événements sensibles.                                                                                     |
| **Immutabilité comptable**     | `orders`, `payments`, `invoices`, `stock_movements` sont **append-only** après finalisation ; corrections via nouvelles lignes.                                                                                                 |
| **Multi-devise / multi-unité** | Prix stockés en **minor units** (`bigint`) + code ISO (`currency_code`). Poids/dimensions en unités SI.                                                                                                                         |
| **i18n natif**                 | Champs traduisibles isolés dans `*_translations (locale, entity_id)`. Locale par défaut : `fr-TN`.                                                                                                                              |
| **Extensibilité IA**           | Tables `embeddings`, `recommendations`, `events` prêtes ; extension `pgvector` prévue mais activée seulement quand utilisée.                                                                                                    |
| **Performance**                | Index composites orientés requêtes catalogue, FTS `tsvector` sur produits/blog, partitionnement futur sur `events` et `stock_movements`.                                                                                        |
| **Sans surprises**             | Contraintes `CHECK`, `NOT NULL`, `FOREIGN KEY ON DELETE` explicites partout. Enums PostgreSQL pour les statuts.                                                                                                                 |
| **GDPR/DPO**                   | PII isolée dans `customers`/`addresses`. `deleted_at` + procédure d'anonymisation documentée.                                                                                                                                   |

---

## 2. Domaines métier (bounded contexts)

Le schéma est organisé en **12 domaines**. Chaque table appartient à un
seul domaine ; les liens inter-domaines passent par clés étrangères
explicites.

```
┌─────────────────────────────────────────────────────────────────────┐
│  IDENTITY & ACCESS       CATALOG                COMMERCE            │
│  users, profiles         products, variants     carts, orders       │
│  roles, permissions      categories, brands     order_items         │
│  user_roles              tags, translations     payments, invoices  │
│  addresses               documents, images      coupon_redemptions  │
│                          certifications                              │
│                                                                      │
│  INVENTORY               FULFILLMENT            SUBSCRIPTIONS       │
│  warehouses              shipments              subscriptions       │
│  stock_items             shipment_events        subscription_items  │
│  stock_movements         shipment_items         subscription_deliv. │
│  product_lots            carriers               (BA Medical+)       │
│                                                                      │
│  B2B & SUPPLIERS         MARKETING              CONTENT & SEO       │
│  suppliers               promotions             blog_posts          │
│  supplier_products       coupons                blog_categories     │
│  b2b_accounts            health_packs           seo_metadata        │
│  purchase_orders (v2)    bundles                media_library       │
│                                                                      │
│  RELATIONSHIPS           SUPPORT                OBSERVABILITY       │
│  reviews                 support_tickets        events              │
│  wishlists               ticket_messages        audit_logs          │
│  warranties              notifications          settings            │
│  advisor_profiles        prescriptions          embeddings          │
│  product_compatibilities                        recommendations     │
│  product_related                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Diagramme entité-relation

<lov-artifact url="/__l5e/documents/ba_medical_erd.mmd" mime_type="text/vnd.mermaid"></lov-artifact>

---

## 4. Enumérations (types PostgreSQL)

```sql
create type app_role         as enum ('admin','staff','b2b','customer');
create type user_status      as enum ('active','pending','suspended','deleted');
create type availability     as enum ('in_stock','low_stock','out_of_stock','preorder','discontinued');
create type usage_profile    as enum ('professional','personal','both');
create type prof_profile     as enum ('particulier','infirmier','medecin','cabinet','clinique','pharmacie');
create type order_status     as enum ('draft','pending','confirmed','processing','shipped','delivered','cancelled','refunded','returned');
create type payment_status   as enum ('pending','authorized','captured','failed','refunded','partially_refunded','cancelled');
create type payment_method   as enum ('card','bank_transfer','cash_on_delivery','wallet','installment','b2b_credit');
create type shipment_status  as enum ('label_created','picked_up','in_transit','out_for_delivery','delivered','returned','lost');
create type subscription_status as enum ('active','paused','cancelled','expired');
create type ticket_status    as enum ('open','pending_customer','pending_staff','resolved','closed');
create type notif_channel    as enum ('in_app','email','sms','push','whatsapp');
create type stock_mvmt_kind  as enum ('inbound','outbound','adjustment','transfer','return','loss');
create type promo_kind       as enum ('percent','fixed_amount','free_shipping','bxgy','bundle');
create type document_kind    as enum ('user_manual','datasheet','certificate','invoice','prescription','warranty_card','other');
create type media_kind       as enum ('image','video','pdf','model3d');
create type audit_action     as enum ('create','update','delete','login','role_grant','role_revoke','export','impersonate');
```

---

## 5. Livrables (fichiers de ce dossier)

| Fichier                                        | Rôle                                                        |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `docs/database/README.md`                      | Vue d'ensemble (ce fichier).                                |
| `docs/database/schema.sql`                     | **Source de vérité** — DDL PostgreSQL complet, RLS incluse. |
| `docs/database/schema.prisma`                  | Représentation ORM de référence (non appliquée).            |
| `docs/database/adr/0001-postgres-supabase.md`  | ADR — pourquoi Postgres/Supabase et pas Prisma en source.   |
| `docs/database/adr/0002-money-and-i18n.md`     | ADR — minor units, i18n via tables séparées.                |
| `docs/database/adr/0003-rls-and-rbac.md`       | ADR — RLS + `has_role()` SECURITY DEFINER.                  |
| `docs/database/adr/0004-inventory-and-lots.md` | ADR — stock, lots, mouvements append-only.                  |
| `docs/database/adr/0005-ai-recommendations.md` | ADR — embeddings, recommandations, events.                  |
| `docs/database/migrations-strategy.md`         | Nommage, ordering, rollback, seed, environnements.          |

---

## 6. Contraintes & index — règles générales

- **PK** : `id uuid default gen_random_uuid()` partout, sauf tables de
  jointure pures qui utilisent `(a_id, b_id)` composite.
- **FK** : `ON DELETE RESTRICT` par défaut ; `CASCADE` uniquement sur
  tables enfants strictement dépendantes (ex. `order_items → orders`,
  `product_images → products`).
- **`updated_at`** : trigger `set_updated_at()` sur chaque table.
- **Recherche** : colonnes générées `search_vector tsvector` +
  index GIN sur `products`, `blog_posts`, `categories`.
- **Slugs** : unique, `citext`, format `^[a-z0-9-]+$`.
- **JSONB** : réservé aux attributs libres (`products.attributes`,
  `events.properties`, `settings.value`). Jamais pour des relations.
- **Index composites** systématiques :
  - `products (deleted_at, availability, category_id)` — listing catalogue.
  - `products (deleted_at, brand_id)` — page marque.
  - `orders (customer_id, created_at desc)` — historique client.
  - `stock_items (warehouse_id, product_id)` unique.
  - `stock_movements (stock_item_id, created_at desc)`.
  - `events (occurred_at desc, name)` — partitionnable par mois.

---

## 7. Stratégie de migration

Voir `docs/database/migrations-strategy.md`. Résumé :

1. **Une migration = un objectif fonctionnel**, nom `YYYYMMDDHHMM__slug.sql`.
2. Ordre imposé dans chaque migration : `CREATE TABLE` → `GRANT` →
   `ALTER TABLE ENABLE ROW LEVEL SECURITY` → `CREATE POLICY` →
   index → triggers.
3. **Toujours idempotent** quand possible (`IF NOT EXISTS`).
4. **Pas de `DROP` destructif** en prod sans une migration `deprecate`
   préalable (fenêtre ≥ 1 sprint).
5. Seed uniquement en migration dédiée `seed_*` (données de référence :
   catégories racines, rôles, permissions, `settings` par défaut).
6. Rollback = migration `down_*` explicite ; pas de rollback
   automatique.

---

## 8. Prochaines étapes (Backend Agent)

Une fois Lovable Cloud activé, le Backend Agent devra :

1. Appliquer `schema.sql` en migrations successives (voir stratégie).
2. Générer les types TypeScript (`supabase gen types typescript`).
3. Câbler les Server Functions (`createServerFn`) — les tables sont
   déjà prêtes pour un accès direct via `supabase-js`.
4. Remplacer `MOCK_PRODUCTS`, `HEALTH_PACKS`, etc. par des loaders
   TanStack Query — les shapes actuelles sont **compatibles 1:1** avec
   le schéma proposé.

---

**Auteur :** Database Architect Agent v1.0 · BA Medical Store
