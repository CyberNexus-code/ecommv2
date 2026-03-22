# Supabase Production Release Runbook

This runbook promotes your current local migrations to hosted production safely.

## Scope

- Baseline schema migration:
  - `supabase/migrations/20260322133418_remote_schema.sql`
- Hardening migration:
  - `supabase/migrations/20260322154500_production_hardening.sql`

## Prerequisites

- You have a Supabase personal access token.
- `SUPABASE_ACCESS_TOKEN` is set in your terminal session.
- You know your project refs:
  - `DEV_PROJECT_REF`
  - `PROD_PROJECT_REF`

PowerShell example:

```powershell
$env:SUPABASE_ACCESS_TOKEN="YOUR_SUPABASE_PAT"
```

## 1) Backup Production

Before any push, create a fresh backup/snapshot in Supabase Dashboard for the production project.

## 2) Confirm Local Migration Files

Check these files exist locally:

```powershell
Get-ChildItem supabase/migrations
```

Expected key files:

- `20260322133418_remote_schema.sql`
- `20260322154500_production_hardening.sql`

## 3) Link to Production

```powershell
npx supabase link --project-ref <PROD_PROJECT_REF>
```

## 4) Inspect Migration State

```powershell
npx supabase migration list
```

Confirm production is behind only by migrations you intentionally want to apply.

## 5) Push Migrations

```powershell
npx supabase db push
```

## 6) Post-Deploy Smoke Tests

Run these immediately against production:

1. Anonymous:
- Browse products/categories successfully.

2. Authenticated user:
- Open account page.
- Update profile fields.
- Add/remove basket items.
- Place an order.

3. Admin:
- Open dashboard.
- Create/update/delete categories.
- Create/update/delete products.
- Upload/delete product images.
- View/update orders.

## 7) Verify Policy/Constraint Health

Use SQL Editor in production for quick checks:

```sql
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname in ('public','storage')
order by schemaname, tablename, policyname;
```

```sql
select column_default
from information_schema.columns
where table_schema='public'
  and table_name='orders'
  and column_name='status';
```

Expected: `orders.status` default is `'open'::text`.

## 8) Monitor

For 30-60 minutes after deploy:

- Watch Supabase logs for permission errors (`42501`) and failed writes.
- If failures occur, patch with a follow-up migration (preferred) instead of direct dashboard edits.

## 9) Rollback Strategy

Preferred order:

1. Small hotfix migration to restore blocked path.
2. If needed, restore from the pre-release backup.

Avoid blanket RLS disable in production unless this is an emergency and approved.

## Useful Commands

Link back to dev:

```powershell
npx supabase link --project-ref <DEV_PROJECT_REF>
```

Check status anytime:

```powershell
npx supabase migration list
```
