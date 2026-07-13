# BA Medical Store — Backend

Documentation vivante du Backend. À maintenir à chaque sprint.

## Sources de vérité

Ordre irrévocable — en cas de conflit, le rang supérieur gagne :

1. `schema.sql` (uploadé) — structure DB
2. `openapi.yaml` (uploadé) — contrat API
3. `CONVENTIONS.md` (uploadé) — RBAC, pagination, erreurs, versionnement
4. `docs/architecture/*` — décisions transverses
5. Composants Frontend existants

## Adaptations Lovable Cloud (décidées Sprint B1)

Voir Delivery Report `docs/backend/B1-REPORT.md`.

- Table `users` (avec `password_hash`) remplacée par `profiles` + `auth.users`.
- Rôle utilisateur externalisé dans `user_roles` + fonction `has_role()`.
- Tables `refresh_tokens`, `password_reset_tokens`, `email_verification_tokens` supprimées (gérées par Lovable Cloud Auth).
- Endpoints `/auth/*` du contrat OpenAPI seront implémentés comme wrappers minces au-dessus de `supabase.auth.*` en Sprint B2.

## Roadmap des sprints Backend

| Sprint | Périmètre | Statut |
|---|---|---|
| B1 | Fondations Auth/RBAC, catalogue, commerce (schéma + RLS + adapters) | ✅ Livré |
| B2 | Server Functions `/auth/*`, `/cart/*`, `/wishlist/*`, `/orders/*`, `/products/*` (lecture) | ⏳ À venir |
| B3 | Inventory, quotes, commercial, warehouses, returns, blog, contact | ⏳ |
| B4 | Admin, reports, audit, imports, préparateur | ⏳ |
| B5 | Recette RLS/RBAC, seed dev, remplacement `MOCK_*` par loaders réels | ⏳ |

## Conventions techniques

### Argent
- DB : `NUMERIC(12,3)` en TND (unité principale, millimes = 3 décimales).
- Frontend : minor units (millimes) via `Money.amount`.
- Conversion centralisée dans `src/lib/mappers/index.ts` (`toMoney` / `fromMoney`).
- ❌ Jamais de `float` sur des sommes.

### RBAC
- Enum : `app_role` = `('client','commercial','preparateur','admin','super_admin')`.
- Stocké dans `public.user_roles(user_id, role)` — **jamais** sur `profiles`.
- Vérification dans les policies RLS via `public.has_role(_user_id, _role)` (`SECURITY DEFINER`).
- Helper composite : `public.is_staff(_user_id)` = commercial ∪ preparateur ∪ admin ∪ super_admin.

### Trigger inscription
Toute nouvelle ligne dans `auth.users` déclenche automatiquement la création :
1. d'un `profiles` (avec email, first_name, last_name, phone, company_name, profession lus depuis `raw_user_meta_data`),
2. d'un `user_roles(user_id, 'client')`.

### RLS — patron par catégorie de table
- **Lecture publique anon+auth** : `categories`, `brands`, `products` (WHERE active), `product_media`, `product_documents`, `packs` (WHERE active), `pack_products`, `product_relations`, `coupons` (WHERE active + valide), `promotions` (WHERE active + fenêtre), `promotion_categories`, `subscription_plans` (WHERE active).
- **Self-owned auth** : `profiles`, `notification_preferences`, `addresses`, `carts`, `cart_items`, `wishlist_items`, `warranties` (lecture), `client_documents` (lecture), `notifications` (lecture + update read/unread), `orders` (lecture + insert self), `order_items` (lecture + insert self), `payments` (lecture), `shipments` (lecture), `subscriptions` (lecture + insert self).
- **Staff-only** : `suppliers`, `order_picking_items`.
- **Admin/super_admin write** : catalogue, coupons, promotions, plans, catégories, marques.

### Adapters
- Un unique fichier `src/lib/mappers/index.ts` — les composants ne parlent jamais aux types Supabase directement.
- Fonctions : `toMoney`, `fromMoney`, `toAvailability`, `toProduct(ProductJoined)`, `toCategory`, `toBrand`.
- Étendre au fur et à mesure des sprints (order, cart, subscription…).

### Migrations
- Une migration = un objectif fonctionnel, nommée `YYYYMMDDHHMM__<slug>.sql` (Lovable Cloud gère le nommage).
- Ordre invariant dans chaque migration : `CREATE TYPE` → `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY` → index → triggers.
- Aucun `GRANT` implicite — chaque table publique liste ses droits.

### Server Functions (à partir de B2)
- `createServerFn` depuis `@tanstack/react-start`, jamais Edge Functions pour la logique app.
- Auth utilisateur : middleware `requireSupabaseAuth` (`@/integrations/supabase/auth-middleware`).
- Admin/service_role : `supabaseAdmin` **uniquement** dans handlers, jamais au top-level.
- Erreurs conformes `CONVENTIONS.md § 4` (`{ error: { code, message, details? } }`).
- Pagination conforme `CONVENTIONS.md § 3` (`{ data, meta: { page, page_size, total_items, total_pages } }`).
