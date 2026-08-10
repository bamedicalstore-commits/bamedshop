# Sprint Backend B1 — Delivery Report

**Date :** 2026-07-13
**Périmètre :** Infrastructure DB + Catalogue + Commerce (schéma seul)
**Statut :** ✅ Livré et validé

---

## 1. Arbitrages préalables (5 conflits détectés, 3 résolus, 2 déclassés)

| #   | Conflit                                                                             | Décision utilisateur                                                     | Impact                               |
| --- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| 1   | `public.users` avec `password_hash` incompatible avec `auth.users` de Lovable Cloud | ✅ Remplacer par `profiles` + `auth.users`, supprimer tables auth maison | 4 tables supprimées, 25 FK réécrites |
| 2   | Colonne `role` sur `users` = risque d'escalade                                      | ✅ Externaliser dans `user_roles` + `has_role()`                         | Enum `app_role` + fonction sécurité  |
| 3   | 0 policy RLS, 0 GRANT dans `schema.sql`                                             | ✅ Écrire matrice RLS depuis `CONVENTIONS.md`                            | 45+ policies dérivées                |
| 4   | Frontend MOCK vs shapes DB                                                          | Adapters `src/lib/mappers`                                               | Composants intacts                   |
| 5   | Volume total ingérable en un tour                                                   | Découpage en 5 sprints B1→B5                                             | Ce sprint = B1 étendu                |

---

## 2. Livrables

### 2.1 Migrations (2 migrations, 1 par correctif)

- **`20260713_082210__b1_foundations_catalog_commerce.sql`** — 29 tables, 12 enums, 3 fonctions, 45+ policies RLS, 20+ index.
- **`20260713_082XXX__security_hardening.sql`** — REVOKE PUBLIC sur `has_role/is_staff/handle_new_user`, extensions déplacées vers schéma `extensions`.

### 2.2 Domaines couverts (29 tables)

| Domaine                 | Tables                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Identité                | `profiles`, `user_roles`, `notification_preferences`                                                                                 |
| Catalogue               | `categories`, `brands`, `suppliers`, `products`, `product_documents`, `product_media`, `packs`, `pack_products`, `product_relations` |
| Client — Adresses       | `addresses`                                                                                                                          |
| Panier                  | `carts`, `cart_items`                                                                                                                |
| Promotions              | `coupons`, `promotions`, `promotion_categories`                                                                                      |
| Commandes               | `orders`, `order_items`, `payments`, `shipments`, `order_picking_items`                                                              |
| Client (post-achat)     | `wishlist_items`, `warranties`, `client_documents`, `notifications`                                                                  |
| Abonnements BA Medical+ | `subscription_plans`, `subscriptions`                                                                                                |

### 2.3 Fonctions & triggers

- `public.set_updated_at()` — trigger appliqué sur 12 tables avec `updated_at`.
- `public.has_role(uuid, app_role)` `SECURITY DEFINER` — brique RBAC unique.
- `public.is_staff(uuid)` `SECURITY DEFINER` — helper `commercial|preparateur|admin|super_admin`.
- `public.handle_new_user()` `SECURITY DEFINER` — crée `profiles` + `user_roles('client')` sur inscription (trigger `on_auth_user_created` sur `auth.users`).

### 2.4 RLS — couverture

- **100 %** des 29 tables ont `ENABLE ROW LEVEL SECURITY` + au moins une policy explicite.
- **100 %** ont un bloc `GRANT` explicite (jamais implicite, conforme règle Lovable Cloud).
- Lecture publique `anon` autorisée uniquement sur : catégories, marques, produits actifs, médias/documents produits, packs actifs, coupons valides, promotions en cours, plans d'abonnement actifs (matrice RBAC `CONVENTIONS.md § 2`).
- Aucune donnée personnelle (`profiles`, adresses, commandes, paiements, wishlist, garanties, documents, notifications, abonnements) accessible à `anon`.

### 2.5 Adapters DB → Frontend

- **`src/lib/mappers/index.ts`** — seul point de conversion.
- Fonctions livrées : `toMoney`, `fromMoney`, `toAvailability`, `toProduct(ProductJoined)`, `toCategory`, `toBrand`.
- Prix : conversion `NUMERIC(12,3) TND` (DB, unité) ↔ `Money.amount` (Frontend, millimes minor units).
- Compatibilité 1:1 vérifiée avec `src/types/product.ts`.

### 2.6 Documentation

- `docs/backend/README.md` — sources de vérité, roadmap, conventions techniques, patrons RLS.
- `docs/backend/B1-REPORT.md` — ce document.

---

## 3. Sécurité — état du linter

| Alerte                                                                  | Statut                                                                                                                                                |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extension in Public (pgcrypto, citext)                                  | ✅ Corrigé (schéma `extensions`)                                                                                                                      |
| SECURITY DEFINER `handle_new_user` accessible                           | ✅ Corrigé (`service_role` + `supabase_auth_admin` uniquement)                                                                                        |
| SECURITY DEFINER `has_role` / `is_staff` accessible aux `authenticated` | 🟢 Accepté par conception — documenté dans `@security-memory` (indispensable aux policies RBAC ; ne retourne qu'un `boolean` sans exposer de données) |

**Aucune alerte de niveau ERROR. Zéro donnée personnelle exposée à `anon`.**

---

## 4. Tests effectués

- Migration 1 : ✅ exécutée sans erreur (58 objets créés).
- Migration 2 (correctifs) : ✅ exécutée sans erreur.
- Types TypeScript : ✅ régénérés automatiquement (1326 lignes, 29 tables + enums exposés).
- Composants Frontend : ✅ intacts, aucun import cassé (adapters isolés dans `src/lib/mappers`).

---

## 5. Ce qui n'a PAS été fait (par design, cf. arbitrages)

- Aucune Server Function écrite → **Sprint B2**.
- Aucun composant Frontend modifié → **Sprint B5**.
- Domaines Inventory, Quotes, Commercial, Blog, Contact, Returns, Warehouses, Reports, Audit, Imports non couverts → **Sprints B3 / B4**.
- Colonne `orders.placed_by_sales_rep_id` créée mais pointe sur `auth.users` (pas encore de table `sales_reps`) → sera enrichie en **Sprint B3**.
- Aucun seed → une migration `seed_reference` dédiée arrivera en **Sprint B5**.
- Endpoint `/auth/*` (login, register, refresh, forgot-password, reset-password) : implémentation wrapper Supabase Auth en **Sprint B2**.

---

## 6. Prochaine étape recommandée — Sprint B2

**Périmètre proposé :**

1. Server Functions Auth (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/me`) — wrappers Supabase Auth conformes au contrat OpenAPI.
2. Server Functions Catalogue publiques (`GET /products`, `GET /products/{slug}`, `GET /categories`, `GET /categories/{slug}`, `GET /brands`, `GET /brands/{slug}`, `GET /packs`) — accès via client publishable server-side + adapters.
3. Server Functions Client authentifiées (`/cart/*`, `/wishlist/*`) — `requireSupabaseAuth`.
4. Utilitaires transverses : `paginate()`, format d'erreur unifié `CONVENTIONS.md § 4`, middleware RBAC `requireRole()`.
5. Configurer Sign in with Google (par défaut Lovable Cloud) + templates emails auth.

**Ce que je NE ferai PAS en B2 (à confirmer) :** modifier les composants pour consommer les serverFn, appliquer les migrations Inventory/Quotes/Commercial, écrire les endpoints Admin.

---

<presentation-actions>
<presentation-open-backend>View Backend</presentation-open-backend>
</presentation-actions>
