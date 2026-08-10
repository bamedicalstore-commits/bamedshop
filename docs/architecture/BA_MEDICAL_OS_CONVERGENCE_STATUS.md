# BA MEDICAL OS — CONVERGENCE STATUS

**Date de la passe :** 2026-08-01
**Baseline utilisée :** repository Lovable réel (`src/`, `supabase/migrations/`, `docs/`) + état Supabase interrogé directement (`information_schema.tables`, `pg_policies`, fonctions DB).
**Nature du document :** état factuel de convergence. Aucune décision PO n'est créée ici.

---

## 0. Méthode et niveau de preuve

- Les affirmations marquées **FAIT VÉRIFIÉ** proviennent d'une lecture directe du repository
  ou d'une requête sur la base distante pendant cette passe.
- Les affirmations marquées **CLAIM HISTORIQUE** proviennent de documents antérieurs
  (`docs/backend/B1-REPORT.md`, gouvernance Kimi, `docs/database/schema.sql`) et ne sont
  **pas** des preuves de l'état courant.
- Là où un claim historique contredit l'état réel, la contradiction est explicitée.

---

## 1. État réel du projet (FAITS VÉRIFIÉS)

### Stack

- TanStack Start v1 + Vite 7 + React 19, Tailwind v4 (`src/styles.css`), shadcn/ui.
- Routing par fichiers plats dans `src/routes/*` (`account.*`, `admin.*`, `catalogue`, `product.$slug`, `packs`, `compare`, …).
- Backend : Lovable Cloud (Supabase) via `src/integrations/supabase/*` (généré).
- `src/start.ts` enregistre `attachSupabaseAuth` comme `functionMiddleware`.

### Ce qui N'EXISTE PAS dans le repository (contredit certains claims historiques)

- **Aucun `openapi.yaml`** (recherche sur tout le repo hors `node_modules`) → la conformité
  OpenAPI ne peut pas être vérifiée depuis ce repository.
- **Aucun `CONVENTIONS.md`**.
- **Aucune couche `repositories/`**, aucun dossier `src/domains/`, aucun service métier.
- **Aucune Server Function** métier (`createServerFn`) : aucun fichier `*.functions.ts`.
- Seule couche d'adaptation présente : `src/lib/mappers/index.ts`.
- Le frontend fonctionne encore sur des données statiques (`src/constants/*`), non sur la DB.

### Migrations réellement présentes (`supabase/migrations/`)

1. `20260713082206_160fd243-….sql`
2. `20260713082229_89af4f71-….sql`
3. `20260801142141_789b7150-….sql`
4. `20260801142159_a2e27d25-….sql`

Aucune migration n'a été créée pendant cette passe.

### Tables réellement présentes dans `public` (29) — requête directe

`addresses, brands, cart_items, carts, categories, client_documents, coupons,
notification_preferences, notifications, order_items, order_picking_items, orders,
pack_products, packs, payments, product_documents, product_media, product_relations,
products, profiles, promotion_categories, promotions, shipments, subscription_plans,
subscriptions, suppliers, user_roles, warranties, wishlist_items`

### Tables ABSENTES de la DB distante (FAIT VÉRIFIÉ)

`warehouses, stock_items, stock_levels, stock_transfers, inventory_counts, product_lots,
stock_movements, order_packages, security_events, login_history, quotes, contacts,
import_export_*, audit_logs, reviews, blog_posts`

> `docs/database/schema.sql` décrit ~55 tables (dont warehouses, stock_items, product_lots,
> stock_movements). **Contradiction avec la DB réelle** : ces structures ne sont pas déployées.
> `schema.sql` est donc un document cible, pas un reflet de la base.

### Enums réellement présents

- `app_role`: `client, commercial, preparateur, admin, super_admin`
- `order_status`: `pending_payment, paid, processing, shipped, delivered, cancelled, refunded`
- `preparation_status`: `to_prepare, in_preparation, ready_to_ship, shipped`
- autres : `coupon_type, payment_method, notification_type, promotion_type,
product_media_type, product_document_type, client_document_type, subscription_status,
warranty_status`

### Fonctions DB présentes

`has_role, is_staff, handle_new_user, resolve_product_price, enforce_cart_item_price,
enforce_order_item_price, enforce_order_totals, recompute_order_totals, set_updated_at`

---

## 2. Décisions PO confirmées — NON ROUVERTES

### Conflict #001 — RESOLVED

Décision maintenue telle quelle : l'API garde `warehouse` en **string**, le Repository résout
le nom vers l'UUID interne, `/inventory/transfers` est dans le scope MVP.
**État réel :** aucune couche Repository, aucune table `warehouses`/stock dans la DB, aucun
endpoint inventory. L'implémentation de la résolution nom→UUID est donc **impossible en l'état**
sans choisir un modèle de stock, ce qui relève de **P1-004 (non décidé)**.
→ Statut : **RESOLVED (décision) / BLOCKED (implémentation, dépend de P1-004)**.
Le contrat API n'a pas été modifié ; aucun UUID n'a été exposé à la place du string.

### Conflict #004 — PO CONFIRMÉ, avec réserve DB

Décision respectée, non réinterprétée. Vérification physique des structures fulfillment :

- `order_picking_items` : **PRÉSENTE** (colonnes `order_id, product_id, quantity,
warehouse_location text, picked, packed`).
- `order_packages` : **ABSENTE** de la DB distante.
- `orders.preparation_status` : **PRÉSENTE** (enum `preparation_status`).
  → Statut : **PARTIELLEMENT VÉRIFIÉ**. Aucune structure manquante n'est déclarée existante.
  Le modèle exact de `order_packages` n'est pas inventé (voir P1-003).

### Conflict #010 — RESOLVED (Option C)

Non rouvert, aucun rollback proposé. `FulfillmentOrder` doit être représenté via `allOf`
côté OpenAPI.
**État réel :** aucun `openapi.yaml` dans ce repository et aucun type applicatif
`FulfillmentOrder` (`src/types/*` ne contient que le domaine produit/catalogue).
→ Statut : **RESOLVED (décision) / NON VÉRIFIABLE DANS CE REPOSITORY** (artefact OpenAPI absent).
L'écart DB sur `preparation_status` est traité séparément (P1-002), pas comme une réouverture.

---

## 3. Registre des points P0 → P2

| ID         | Sujet                                                   | Statut                              | Preuve / Raison                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **P0-001** | Source de vérité DB vs `schema.sql`                     | **VERIFIED (écart documenté)**      | DB = 29 tables ; `schema.sql` ≈ 55. `schema.sql` est cible, pas état courant. Aucune migration corrective faite.                                                                                                   |
| **P0-002** | RBAC canonique (`app_role` DB vs `Role` OpenAPI)        | **PO DECISION REQUIRED**            | DB `app_role` = client/commercial/preparateur/admin/super_admin. Aucun artefact OpenAPI présent pour comparer. Aucun mapping choisi. **NO IMPLEMENTATION BY ASSUMPTION.**                                          |
| **P0-003** | Modèle canonique `order_status`                         | **PO DECISION REQUIRED**            | Enum DB à 7 valeurs, utilisé par `orders` + triggers de totaux. Aucun mapping/renommage effectué. **NO IMPLEMENTATION BY ASSUMPTION.**                                                                             |
| **P1-001** | Conflict #005 Audit/Sécurité                            | **BLOCKED**                         | `security_events`, `login_history`, `security_event_type` absents de la DB. Non créés, enums non fusionnés. **NO IMPLEMENTATION BY ASSUMPTION.**                                                                   |
| **P1-002** | Persistance `preparation_status` après #010             | **PO DECISION REQUIRED**            | Fait : colonne `orders.preparation_status` existe déjà. Le choix colonne / table satellite / dérivation reste non décidé ; aucune migration.                                                                       |
| **P1-003** | Modèle `order_picking_items` / `order_packages`         | **PARTIELLEMENT VÉRIFIÉ + BLOCKED** | `order_picking_items` existe ; `order_packages` absente. Modèle non inventé.                                                                                                                                       |
| **P1-004** | `stock_transfers` / `stock_levels` / `inventory_counts` | **BLOCKED**                         | Aucune table stock/warehouse en DB. Le volet `/inventory/transfers` de #001 est approuvé mais non implémentable sans modèle de stock décidé. Aucun renommage `stock_items`→`stock_levels` (la table n'existe pas). |
| **P1-005** | Domaines Commercial / Quotes / Contact / Import-Export  | **BLOCKED**                         | Aucune table ni route correspondante. Scope MVP non confirmé → rien créé.                                                                                                                                          |
| **P2-001** | Couche Repository / Server Functions métier             | **NOT IMPLEMENTED (factuel)**       | Aucun `*.functions.ts`, aucun `repositories/`. Dépend de P0-002/P0-003 pour le typage des statuts et rôles.                                                                                                        |
| **P2-002** | Branchement du frontend sur la DB                       | **NOT IMPLEMENTED (factuel)**       | Routes publiques alimentées par `src/constants/*`. `src/lib/mappers/index.ts` prêt, non câblé. Non régressé pendant cette passe.                                                                                   |
| **P2-003** | Artefacts de contrat (`openapi.yaml`, `CONVENTIONS.md`) | **BLOCKED / ARTEFACT ABSENT**       | Absents du repository. Toute vérification de conformité API (dont #010 `allOf`) est impossible tant qu'ils ne sont pas versionnés ici.                                                                             |

---

## 4. Séparation faits vérifiés / claims antérieurs

| Claim antérieur                                                   | État réel vérifié                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| « B1 a créé 29 tables couvrant Identity/Catalog/Commerce »        | **Confirmé** : 29 tables `public` présentes.                                          |
| « schema.sql est la source de vérité déployée »                   | **Contredit** : ~26 tables de `schema.sql` ne sont pas en DB.                         |
| « structures fulfillment approuvées présentes »                   | **Partiel** : `order_picking_items` oui, `order_packages` non.                        |
| « #010 appliqué côté OpenAPI »                                    | **Non vérifiable ici** : pas d'`openapi.yaml` dans le repository. Décision maintenue. |
| « couche repositories / warehouse resolver en place »             | **Contredit** : aucune couche de ce type dans `src/`.                                 |
| « document de convergence déjà créé lors d'une passe précédente » | **Contredit** : le fichier n'existait pas ; il est créé et persisté par cette passe.  |

---

## 5. Fichiers réellement modifiés par cette passe

- `docs/architecture/BA_MEDICAL_OS_CONVERGENCE_STATUS.md` (créé)

Aucun fichier applicatif (`src/**`) modifié. Aucune UI/UX touchée.

## 6. Migrations créées par cette passe

**NONE.**

---

## 7. Risques restants

1. Divergence documentaire : `schema.sql` / `schema.prisma` décrivent une cible non déployée ;
   risque de raisonnement sur des tables inexistantes.
2. Absence d'`openapi.yaml` et de `CONVENTIONS.md` dans le repository : #010 et P0-002/P0-003
   ne peuvent pas être vérifiés contractuellement ici.
3. Frontend encore découplé de la DB : tout branchement futur exposera les blocages P0-002/P0-003.
4. `orders.preparation_status` existe déjà en DB alors que sa stratégie de persistance est
   non décidée : risque d'usage implicite qui préempterait P1-002.
5. `order_packages` absente alors que #004 est confirmé : le fulfillment n'est pas complet en DB.
