# Vercel Launch Guide

This project is suitable for a small-company order-placement storefront on Vercel, provided the required environment variables and Supabase auth settings are configured correctly.

## Good Fit for Current Scope

- No payment gateway is required today.
- Orders are placed inside the app and handled operationally outside a payment processor.
- Vercel Free is acceptable for an MVP launch with modest traffic and a small product catalogue.

## Before You Deploy

You need these environment variables in Vercel:

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

Set `NEXT_PUBLIC_SITE_URL` to your real Vercel URL or custom domain.

Examples:

```bash
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

or:

```bash
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
```

## Vercel Deployment Steps

1. Push the repo to GitHub.
2. Create a new Vercel project and import the GitHub repository.
3. Framework preset: `Next.js`.
4. Add all required environment variables in Vercel Project Settings.
5. Deploy.

## Supabase Production Settings

After you know your deployed domain, update Supabase hosted settings.

### Auth Site URL

In Supabase Dashboard:

- Authentication -> URL Configuration
- Set Site URL to your deployed domain, for example:

```bash
https://www.yourdomain.com
```

### Additional Redirect URLs

Add:

```bash
https://www.yourdomain.com/auth/callback
https://your-project.vercel.app/auth/callback
```

If you use both the Vercel preview domain and the final production domain, include both where appropriate.

### OAuth Providers

If Google or Facebook login is enabled, update those providers so their allowed redirect URLs match the deployed callback URL.

## SMTP

This app sends contact and order emails with Nodemailer.

That means Vercel does not send the emails for you. Vercel only hosts the app. You still need a real SMTP provider configured through:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

## Vercel Free Plan Reality Check

For the current storefront scope, Vercel Free is fine if:

- traffic is low to moderate
- catalog size is modest
- email volume is modest
- admin usage is light

Watch for these constraints:

- limited monthly function usage
- no strong uptime guarantees
- preview/production environment management is simpler than enterprise-grade hosting, but not the same thing as a full ops platform

For a small business MVP, this is a reasonable starting point.

## Is This Production-Ready for a Small Company?

Yes, for a small company order-placement storefront MVP.

That answer is based on the current scope:

- no online payment integration yet
- manageable traffic expectations
- manual or semi-manual operational handling after order placement
- authenticated admin catalogue management exists
- lint and production build are passing
- CI is in place

It is not yet enterprise-hardened. The main remaining gaps are:

- automated regression tests
- monitoring and alerting
- backup/restore drills
- deployment runbooks for non-technical operators
- stronger incident and rollback process

Those are important, but they do not block a sensible small-business MVP launch.

## Future Supabase Migration to a Client-Owned Project

Yes, it is possible to move this database setup to a new Supabase account or new Supabase project later.

### What Transfers Cleanly

The database schema and SQL-based behavior are already represented in migration files under `supabase/migrations/`.

That includes the current known migration history, such as:

- baseline schema
- production hardening
- account lifecycle behavior
- basket/order RPCs
- tags feature
- guest merge logic
- product SEO and image alt text fields

### How You Would Do It Later

1. Create a new Supabase project under the client account.
2. Link the local repo to the new project:

```bash
npx supabase link --project-ref YOUR_NEW_PROJECT_REF
```

3. Push the migrations:

```bash
npx supabase db push
```

This replays the migration history into the new database.

### What Does Not Automatically Move with SQL Migrations

SQL migrations are not the entire Supabase project.

You still need to manually recreate or verify:

- hosted auth settings
- OAuth provider credentials
- SMTP/auth email settings inside Supabase
- project API keys and secrets
- allowed redirect URLs
- storage objects already uploaded in buckets
- domain-specific dashboard settings

Important distinction:

- bucket definitions and storage policies may be reproducible if they were created through SQL migrations
- the actual uploaded files inside storage are not moved by `supabase db push`

If the client needs a full cutover later, the usual process is:

1. Push schema migrations to the new Supabase project.
2. Export and import the existing data.
3. Copy storage assets separately.
4. Reconfigure auth, SMTP, and OAuth settings.
5. Update the app environment variables to point at the new project.

## Recommended Launch Sequence

1. Set Vercel environment variables.
2. Deploy to Vercel.
3. Update Supabase Site URL and redirect URLs.
4. Verify login, signup, forgot password, guest basket, order placement, admin edits, and outgoing emails.
5. Point your custom domain to Vercel.
