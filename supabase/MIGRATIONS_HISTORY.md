# Historique des migrations : dépôt = source de vérité

État constaté le 2026-11-22 (lecture seule via le connecteur Supabase).

| Projet | Rôle | Désigné par |
|---|---|---|
| `vetltexel…` | **Production** | `.github/workflows/admin-production-e2e.yml` |
| `rkaziatu…` | Staging | `.github/workflows/supabase-real-activation.yml` |

`supabase/config.toml` cite un troisième projet (`bkicpp…`), absent du compte : ancien projet Lovable Cloud, à ne pas utiliser.

## Dérives corrigées dans le dépôt

| Migration | Où elle existait | Action |
|---|---|---|
| `20260901140000_fix_catalog_activation_engine_role_signature` | Production seulement | Ajoutée au dépôt (contenu identique) |
| `20260902235000_revoke_shipping_authority_rpc_execute` | Staging seulement (`20260902222105`) | Ajoutée au dépôt |
| `s5_m1_retail_activation_gate_final` ×2, `s5_m2_shipping_authority_staging` | Staging seulement | **Non reprises** : remplacées par `20260902230000_s5_catalog_checkout_security_authority` (même politique, même `resolve_product_price`) ; `s5_m2` est vide |
| `20260901125055_fix_catalog_activation_engine_role_signature` | Staging | Même contenu que `20260901140000` |

## Versions à réparer dans l'historique du staging (`supabase migration repair`)

Le connecteur MCP enregistre les migrations avec l'heure d'application, pas la version du fichier :

| Version staging | Version dépôt |
|---|---|
| 20260901125055 | 20260901140000 |
| 20260902221842 | 20260902230000 |
| 20260902222149 | 20260902234500 |
| 20260902222105 | 20260902235000 |
| 20261122130834 | 20261122140000 |
| 20260901100806, 20260901100935, 20260901101419 | à marquer `reverted` (remplacées) |

## Rattrapage de la production (à faire après validation d'AB)

Migrations du dépôt absentes en production, dans l'ordre :

1. `20260902230000_s5_catalog_checkout_security_authority` : visibilité publique limitée aux produits `ACTIVE` et règle de livraison 8 DT / offerte dès 200 DT.
2. `20260902234500_shipping_authority_invoker_hardening`
3. `20260902235000_revoke_shipping_authority_rpc_execute`
4. `20261122140000_private_supplier_costs_and_public_price` : prix fournisseurs privés, prix public dérivé du prix approuvé.

Toutes sont idempotentes. Avant : sauvegarde (Database → Backups) ; après : tests anon / client / admin comme sur le staging.
