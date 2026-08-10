# Migration Strategy

## Nommage

`supabase/migrations/YYYYMMDDHHMM__<slug>.sql`

- Un objectif fonctionnel par migration.
- Slug court, en `kebab-case` : `create-catalog`, `add-warranties`, `seed-roles`.
- Pas plus d'un domaine métier par fichier lorsque le domaine est neuf.

## Ordre canonique par migration

Chaque migration créant des tables `public.*` suit strictement :

1. `CREATE EXTENSION IF NOT EXISTS ...` (rare, en tête de fichier).
2. `CREATE TYPE ... AS ENUM` si nécessaire.
3. `CREATE TABLE public.<t> (...)`.
4. `GRANT ... TO anon | authenticated | service_role` — obligatoire, jamais
   omis (PostgREST n'accorde rien par défaut).
5. `ALTER TABLE public.<t> ENABLE ROW LEVEL SECURITY`.
6. `CREATE POLICY ...` (au moins une par rôle qui accède).
7. Index secondaires (`CREATE INDEX ...`).
8. Triggers (`updated_at`, audit).

Ne jamais séparer table et grants/policies dans deux migrations.

## Rollback

- Rollback = **nouvelle migration** `YYYY..__down-<slug>.sql`. Jamais
  d'annulation destructive en place.
- Toute suppression de colonne suit ce protocole :
  1. Migration `deprecate` : la colonne devient nullable, code cesse de
     l'utiliser (≥ 1 sprint).
  2. Migration `drop` : `ALTER TABLE ... DROP COLUMN`.

## Seed

- Une migration `seed_<domain>` dédiée pour les données de référence :
  `roles`, `permissions`, `carriers`, `certifications`, `subscription_plans`
  minimum, `settings` par défaut.
- Aucune donnée métier de démo dans les seeds prod. Les fixtures démo
  vivent dans `supabase/seed.dev.sql` (dev uniquement).

## Environnements

| Env     | Objectif                         | Reset autorisé ? |
| ------- | -------------------------------- | ---------------- |
| dev     | Playground, fixtures riches      | Oui              |
| staging | Miroir prod, données anonymisées | Non              |
| prod    | Réel                             | Jamais           |

## Vérifications avant merge

- [ ] Chaque nouvelle table publique a **GRANT + RLS + POLICY**.
- [ ] Chaque FK a `ON DELETE` explicite (RESTRICT par défaut).
- [ ] Colonnes monétaires en `bigint` minor units + `currency_code`.
- [ ] Colonnes texte utilisateur en `text` (jamais `varchar(n)` arbitraire).
- [ ] Index composites créés pour toute requête connue > 10 ms attendue.
- [ ] Trigger `set_updated_at` posé si la table a `updated_at`.
- [ ] Types TypeScript regénérés (`supabase gen types typescript`).

## Découpage recommandé (ordre initial)

```
20260101_0900__extensions-and-enums.sql
20260101_0910__identity-core.sql          -- profiles, roles, permissions, user_roles, has_role
20260101_0920__addresses-b2b.sql
20260101_0930__catalog-core.sql           -- categories, brands, suppliers, tags, products
20260101_0940__catalog-media.sql          -- media_library, product_images, documents, certifications
20260101_0950__catalog-relations.sql      -- compat, related, fbt, translations, price_history
20260101_1000__bundles-health-packs.sql
20260101_1010__inventory.sql              -- warehouses, stock_items, lots, movements
20260101_1020__commerce-cart.sql
20260101_1030__commerce-orders.sql        -- orders, order_items, history, prescriptions, warranties
20260101_1040__commerce-payments.sql      -- payments, invoices
20260101_1050__fulfillment.sql            -- carriers, shipments, events
20260101_1100__subscriptions.sql
20260101_1110__marketing.sql              -- promotions, coupons, redemptions
20260101_1120__reviews-wishlist-advisor.sql
20260101_1130__notifications-support.sql
20260101_1140__content-blog.sql
20260101_1150__seo-metadata.sql
20260101_1200__observability.sql          -- audit_logs, settings, events, embeddings, recommendations
20260101_1210__seed-reference.sql
```

## Automation à prévoir (post-activation Cloud)

- Job pg_cron nocturne : recalcul `product_fbt` depuis `order_items`.
- Job pg_cron hebdo : rotation `audit_logs` > 12 mois vers stockage froid.
- Partition mensuelle de `events` dès > 5 M lignes.
