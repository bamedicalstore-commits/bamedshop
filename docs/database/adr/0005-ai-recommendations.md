# ADR 0005 — Recommandations, embeddings et analytics events

**Statut :** Accepté · 2026-07-12

## Décision

1. **`events`** capte tous les signaux comportementaux
   (`product_view`, `add_to_cart`, `checkout_start`, `search`, ...).
   Colonnes : `name`, `user_id?`, `session_id`, `entity_type`,
   `entity_id`, `properties jsonb`, `occurred_at`. Prévue pour
   **partitionnement mensuel** au-delà de 5 M lignes.
2. **`product_fbt`** (frequently bought together) est **précalculée**
   par un job pg_cron nocturne qui agrège les `order_items` co-occurrents.
   Le frontend lit une table plate, jamais une agrégation à chaud.
3. **`product_related`** stocke les similarités éditoriales ou
   déduites (score 0..1, raison textuelle).
4. **`recommendations`** stocke des recommandations calculées et
   personnalisées (`kind ∈ {similar, fbt, for_you, pack}`), indexées
   `(user_id, kind, score desc)`.
5. **`embeddings`** table prête pour vectorisation (produits, blog).
   Extension `pgvector` **non activée** au démarrage — colonne
   `embedding_json` en fallback, migration vers `vector(1536)` sans
   friction quand le besoin apparaît.

## Justification

- Découpler capture (events) / calcul (jobs) / lecture (tables plates)
  garantit des temps de réponse constants côté client, quel que soit
  le volume d'historique.
- Le schéma déjà en place permet au frontend d'appeler dès aujourd'hui
  `recommendations.forUser(user_id, kind)` — les données sont vides
  tant que les jobs ne tournent pas, mais le contrat est stable.
- `pgvector` sera activé quand une vraie fonctionnalité (recherche
  sémantique, recommandation embedding-based) le justifie — pas
  avant.

## Conséquences

- Le Backend Agent devra implémenter :
  - endpoint d'ingestion `/api/public/events` (rate-limité, signé).
  - jobs pg_cron : `rebuild_fbt`, `rebuild_related`,
    `refresh_user_recos`.
  - fonction SQL `recommendations.for_user(uuid, text, int)` pour
    lecture typée.
- Aucun coût IA au démarrage. L'activation `pgvector` + génération
  d'embeddings sera une décision produit ultérieure.
