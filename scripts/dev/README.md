# Supabase Dev Introspection

This folder contains a dev-only workflow for exporting database context (schema, constraints, relations, RLS policies, functions, triggers, views, indexes, enums) into a local JSON file for debugging and AI context sharing.

## Safety model

- The SQL function is created in `public` for API visibility.
- Execution is granted to `service_role` only.
- The export script requires `DEV_DB_INTROSPECTION=1`.
- Output is written to `.dev/supabase-introspection.json` and `.dev/` is gitignored.
- Do not run this in production.

## 1) Install RPC in DEV database

Run `scripts/dev/supabase_dev_introspection.sql` in your DEV Supabase SQL editor.

If you update that SQL helper, run it again so your DEV function definition stays current.

## 2) Configure local env

Add this to your local `.env.local` (or shell env):

- `SUPABASE_SERVICE_ROLE_KEY=...` (DEV project only)
- `DEV_DB_INTROSPECTION=1`
- Optional: `DEV_INTROSPECTION_SCHEMAS=public,auth`

`NEXT_PUBLIC_SUPABASE_URL` is already used by the app and is required by the script.

## 3) Export introspection snapshot

Run:

```bash
npm run db:introspect:dev
```

Output file:

`/.dev/supabase-introspection.json`
