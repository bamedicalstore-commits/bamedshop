# ADR 0001 — PostgreSQL managé (Lovable Cloud / Supabase) comme source de vérité

**Statut :** Accepté · 2026-07-12
**Contexte :** Le brief demandait un « schéma Prisma ». La stack Lovable
impose Lovable Cloud (Supabase) : PostgreSQL managé, migrations SQL,
Row Level Security, PostgREST, Auth, Storage, Edge/Server Functions.

## Décision

1. **Source de vérité** = migrations SQL versionnées dans
   `supabase/migrations/`. Le schéma est décrit en DDL PostgreSQL
   natif (`docs/database/schema.sql`).
2. **Prisma n'est PAS installé** dans l'application. Un `schema.prisma`
   est fourni **uniquement à titre documentaire** pour équipes
   habituées à cette syntaxe (`docs/database/schema.prisma`).
3. Types applicatifs générés via `supabase gen types typescript` — pas
   de client ORM au runtime, on utilise `supabase-js` + PostgREST + les
   Server Functions TanStack.

## Justification

- Prisma dupliquerait la source de vérité (schema.prisma vs migrations
  SQL) et créerait un risque de dérive.
- Prisma nécessite un runtime Node ; la couche Server Functions de
  Lovable tourne sur Cloudflare Workers, où Prisma requiert un data
  proxy payant et une configuration complexe.
- Supabase impose déjà RLS + PostgREST : passer par Prisma ferait perdre
  les policies RLS côté client publishable et exigerait de tout
  ré-implémenter côté serveur.
- Le SQL brut donne accès à `tsvector`, `pgvector`, `pg_cron`,
  `partitioning`, extensions et types dont nous aurons besoin.

## Conséquences

- Tous les développeurs doivent lire du SQL. C'est acceptable et
  souhaitable pour un projet Postgres-first.
- Le fichier Prisma restera synchronisé au mieux mais **le SQL fait
  foi** en cas de conflit.
- Les migrations passent par l'outil Lovable Cloud (`supabase--enable`
  puis outils de migration), pas via `prisma migrate`.
