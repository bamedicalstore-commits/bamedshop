# S5.3 — CI STAGING GATE

GitHub `main` may automatically validate and apply committed Supabase migrations only against the dedicated BA Medical Store Staging project.

Production `vetltexelrqcgbwgggvj` is never targeted by the automatic workflow.

```text
GitHub main → CI / Staging → Security/E2E evidence → READY FOR PRODUCTION → explicit PO GO → Production
```

Staging project ref: `rkaziatuqxsedcusxgaq`.

GitHub Actions credentials must use dedicated staging secrets: `SUPABASE_STAGING_DB_URL` or `SUPABASE_STAGING_DB_PASSWORD`.

Production deployment remains a separate explicitly authorized operation after staging/security approval.
