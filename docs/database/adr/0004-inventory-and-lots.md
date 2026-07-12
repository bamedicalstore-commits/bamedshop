# ADR 0004 — Stocks, lots, mouvements append-only

**Statut :** Accepté · 2026-07-12

## Décision

1. **`stock_items`** stocke l'état courant `(warehouse, product,
   variant)` : `quantity_on_hand`, `quantity_reserved`, seuils de
   réapprovisionnement. Unique `(warehouse_id, product_id, variant_id)`.
2. **`product_lots`** trace chaque lot reçu (numéro de lot,
   série, date de fabrication, **date de péremption**, fournisseur).
3. **`stock_movements`** est **append-only** : toute variation de stock
   (`inbound`, `outbound`, `adjustment`, `transfer`, `return`, `loss`)
   génère une ligne signée `quantity_delta`. Rien n'est jamais mis à
   jour ou supprimé.
4. `stock_items.quantity_on_hand` est **matérialisé** — recalculable à
   tout moment via `SUM(quantity_delta)` filtré par `stock_item_id`.
5. Un index sur `product_lots.expires_at` alimente les alertes de
   péremption (job pg_cron).

## Justification

- La traçabilité des lots est **obligatoire** pour du matériel médical
  (norme ISO 13485, rappels fournisseurs, gestion pharmaceutique).
- L'append-only garantit un audit complet et permet la reconstruction
  d'un inventaire à toute date passée.
- La matérialisation évite le `SUM` à chaque affichage catalogue.

## Conséquences

- Toute écriture logique (commande → sortie de stock) passe par un
  service qui insère un `stock_movement` **et** met à jour
  `stock_items.quantity_on_hand` dans la même transaction.
- Un job de réconciliation hebdomadaire compare l'état matérialisé à
  la somme des mouvements et alerte en cas d'écart.
- Les rappels de lots (recall) sont triviaux : `SELECT ... FROM
  product_lots WHERE lot_number = ...` puis remontée aux
  commandes via `stock_movements.reference_id`.
