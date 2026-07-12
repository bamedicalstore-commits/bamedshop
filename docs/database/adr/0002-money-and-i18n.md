# ADR 0002 — Argent en minor units, i18n via tables séparées

**Statut :** Accepté · 2026-07-12

## Décision monnaie

- Tous les montants sont stockés en **`bigint` minor units** + colonne
  `currency_code char(3)` (ISO 4217).
- TND = millimes (1 TND = 1000). EUR = centimes. USD = cents.
- Colonne dédiée par contexte : `price_minor`, `subtotal_minor`,
  `total_minor`, `refunded_amount_minor`, etc.
- Aucun `float`, `real`, `double precision` ni `numeric` pour de
  l'argent — jamais.

### Justification

- Élimine les erreurs d'arrondi binaires (float).
- Permet des opérations atomiques et des sums exacts.
- Formatage confié à la couche présentation (`Intl.NumberFormat`
  côté client, déjà en place dans `src/lib/format.ts`).
- Multi-devise dès le jour 1 sans changement de schéma futur.

### Conséquences

- Chaque fois qu'on affiche un prix on divise par 10^(minor decimals
  de la devise). Un helper commun sera fourni côté backend.
- Les rapports comptables agrègent en minor units puis convertissent
  au format d'affichage à la toute fin.

## Décision i18n

- Colonnes principales (`name`, `description`) restent sur la table
  entité en **locale par défaut `fr-TN`**.
- Traductions dans une table dédiée `*_translations (entity_id, locale, ...)`
  avec PK composite. Une ligne par (entité, locale).
- Locale des utilisateurs stockée sur `profiles.locale` (défaut `fr-TN`).

### Justification

- Simplicité pour un projet initialement mono-langue.
- Extension future à `ar-TN`, `en-US` sans migrations lourdes.
- Requêtes sans join tant qu'on affiche la locale par défaut.

### Alternatives rejetées

- **`jsonb {fr, ar, en}` par colonne** : rend les index et les FTS
  ingérables ; rejeté.
- **Une table unique `translations` polymorphe** : perd le typage FK ;
  rejeté sauf pour le champ SEO (`seo_metadata` reste polymorphe pour
  d'autres raisons).
