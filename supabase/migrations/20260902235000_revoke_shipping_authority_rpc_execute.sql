-- BA Medical Store — fonction de trigger non appelable via l'API
-- Récupéré le 2026-11-22 depuis l'historique du STAGING (version 20260902222105),
-- où elle était appliquée sans exister dans le dépôt. Contenu identique.
-- enforce_order_shipping_authority() est un trigger : aucun rôle API n'a à l'appeler.

revoke execute on function public.enforce_order_shipping_authority() from anon, authenticated;
