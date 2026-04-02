# Cute & Creative Toppers

Next.js storefront and admin dashboard for a handmade cake topper and party accessories business. The app uses Supabase for auth, profiles, baskets, orders, categories, products, and tags.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Supabase SSR auth and database access
- Nodemailer for contact and order emails
- Recharts for dashboard reporting

## Core Features

- Guest basket flow backed by anonymous Supabase users
- Account signup, login, password recovery, and email confirmation
- Guest-to-account basket and order merge on signup/login
- Product catalogue with category and tag filtering
- Admin dashboard for products, categories, tags, and orders
- Contact form with optional basket snapshot

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CONTACT_EMAIL=
ORDER_ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

3. Start the app:

```bash
npm run dev
```

4. Open http://localhost:3000

## Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CONTACT_EMAIL=
ORDER_ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit it to git.
- Keep service-role usage limited to server-only modules.
- Rotate secrets immediately if a local env file is ever copied into logs, screenshots, or version control.
- Set `NEXT_PUBLIC_SITE_URL` in production so metadata, sitemap, and robots entries resolve to the correct domain.

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npm run test:e2e
npm run db:introspect:dev
```

## Docker

This repo includes a production Docker build:

```bash
docker build -t ecommv2 .
docker run --env-file .env.local -p 3000:3000 ecommv2
```

## CI

GitHub Actions CI is configured in `.github/workflows/ci.yml`.

- `lint` runs on every push to `main` and every pull request.
- `build` runs after lint and requires repository secrets for the production-style environment variables used during Next.js build-time data fetching.
- `e2e` runs Playwright smoke tests after the build job and exercises the storefront in Chromium.

Required GitHub Actions secrets:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
CONTACT_EMAIL
ORDER_ADMIN_EMAIL
NEXT_PUBLIC_SITE_URL
```

## Playwright E2E

Playwright smoke tests live under `tests/e2e/` and run against a production build started with `npm run start:test`.

Local workflow:

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

The current suite covers:

- storefront shell rendering
- product listing to product-detail navigation
- a mobile viewport check that the product-detail page does not overflow horizontally

## Database Validation

GitHub Actions now validates database changes before the build job runs.

- A local Supabase stack is started in CI.
- The DB validation path uses `supabase db start`, so it only starts the database container.
- Migrations are replayed with `supabase db reset --local`.
- Schema checks run with `supabase db lint --local`.
- pgTAP smoke tests run from `supabase/tests/`.

Local workflow:

```bash
npx supabase db start
npx supabase db reset --local
npx supabase db lint --local --level warning --fail-on error
npx supabase test db --local
npx supabase stop --no-backup
```

## Remote Images

Next.js remote image optimization is driven from `NEXT_PUBLIC_SUPABASE_URL` in `next.config.ts`.

- The build extracts the hostname from that URL and whitelists it for `next/image`.
- This keeps the app portable across Supabase projects and environments instead of hardcoding a single project host.
- If the env var points at a different Supabase project in staging or production, image optimization will follow automatically.

## Project Notes

- Auth and guest-order merge behavior are documented in `AUTH_POSTMORTEM.md`.
- Repo, security, SEO, accessibility, and best-practice audit findings are documented in `AUDIT_REPORT.md`.
- Vercel deployment and future Supabase migration notes are documented in `VERCEL_LAUNCH_GUIDE.md`.
- Post-deploy smoke tests are documented in `POST_DEPLOY_CHECKLIST.md`.
