# ADR 0003 — RLS + RBAC via table `user_roles` et `has_role()` SECURITY DEFINER

**Statut :** Accepté · 2026-07-12

## Décision

1. Les rôles applicatifs (`admin`, `staff`, `b2b`, `customer`) sont
   stockés dans **`public.user_roles`**, PK composite `(user_id, role)`.
2. **Jamais** de colonne `role` sur `profiles` ou toute autre table
   utilisateur — risque connu d'escalade de privilèges.
3. Une fonction `public.has_role(uuid, app_role)` en
   `SECURITY DEFINER` avec `SET search_path = public` sert de brique
   unique pour toutes les policies RLS.
4. Chaque table publique a **au minimum** :
   - un `GRANT` explicite aux rôles PostgREST qui doivent y accéder
     (`anon`, `authenticated`, `service_role`) ;
   - `ENABLE ROW LEVEL SECURITY` ;
   - au moins une `POLICY` par action (`select`, `insert`, `update`,
     `delete`) autorisée.

## Justification

- Table séparée : suit la recommandation officielle Supabase, empêche
  qu'un `UPDATE profiles SET role='admin'` compromette le système.
- `SECURITY DEFINER` : évite la récursivité RLS lorsqu'une policy sur
  `user_roles` référence elle-même `user_roles`.
- `has_role()` centralise la logique, testable, moddable en un seul
  endroit.

## Modèle de politiques (matrice)

| Table                | anon | customer (self) | staff | admin |
|----------------------|:----:|:---------------:|:-----:|:-----:|
| products, categories, brands, blog_posts (published) | R | R | RW | RW |
| media_library         | R    | R               | RW    | RW    |
| profiles              | —    | RW (self)       | R     | RW    |
| addresses, wishlists  | —    | RW (self)       | R     | RW    |
| orders, payments, invoices | — | R (self) / W insert | RW | RW |
| stock_items, movements | —   | —               | RW    | RW    |
| audit_logs            | —    | —               | R     | R     |
| settings              | R (public keys) | R | R | RW |
| user_roles            | —    | R (self)        | R     | RW    |

R = SELECT · W = INSERT/UPDATE/DELETE.

## Conséquences

- Chaque migration doit décrire ses policies. Les revues bloquent
  toute table sans RLS explicite.
- Les tests d'accès sont écrits en SQL (`set role authenticated; set
  request.jwt.claims ...; select ...`) et intégrés en CI dès que le
  backend commence.
