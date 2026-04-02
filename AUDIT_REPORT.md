# App Audit Report

## Scope

This audit covered repo hygiene, security posture, SEO metadata, accessibility, and general best-practice debt after the auth and guest-account refactor stabilized.

## Executive Summary

- The app is functionally in much better shape after the auth refactor and guest merge work.
- The most important security concern found during this audit was local handling of the Supabase service-role key.
- The repo still has notable lint and maintainability debt.
- SEO and route metadata were underdeveloped before this pass.
- Accessibility has several easy wins, plus some deeper component-level cleanup still required.

## Security Findings

### Critical

1. `SUPABASE_SERVICE_ROLE_KEY` exists in local env configuration.
   - This is expected for server-only admin tasks, but it must never be committed, logged, exposed to the browser, or shared in screenshots.
   - Action: keep `.env*` ignored, keep admin client server-only, rotate the key immediately if it was ever exposed outside your local machine.

### High

2. A hardcoded fallback personal email address existed in order email handling.
   - This created accidental routing risk and leaked personal operational detail into application code.
   - Action taken: replaced with env-driven configuration and a safer fallback to `SMTP_USER`.

3. Debug logging remains in several files.
   - Some logs may expose operational details or sensitive values during failures.
   - Recommended next step: remove or gate non-essential `console.log` and `console.error` calls, especially around auth, basket, and dashboard server actions.

### Medium

4. Account-existence prompts intentionally reveal whether an email belongs to a registered account.
   - This improves checkout UX, but it is still a mild enumeration tradeoff.
   - Recommendation: keep the current UX only if the business value is intentional, otherwise switch to a neutral message.

## Repo Hygiene Findings

1. The README was still default framework boilerplate.
   - Action taken: replaced with project-specific setup and security guidance.

2. Editor workspace settings were not ignored.
   - Action taken: updated `.gitignore` to ignore local `.vscode` noise while allowing shared workspace config files if needed.

3. The repo still contains documentation drift risk.
   - Recommendation: keep env, auth, and deployment docs updated whenever Supabase or email config changes.

## SEO Findings

### Fixed in this pass

1. Root metadata was too minimal.
   - Action taken: added `metadataBase`, title templates, description, keywords, Open Graph, Twitter, robots, and canonical support.

2. No sitemap or robots route existed.
   - Action taken: added `src/app/sitemap.ts` and `src/app/robots.ts`.

3. Core marketing pages lacked page-specific metadata.
   - Action taken: added route metadata to home, about, and contact pages.

### Remaining SEO work

4. Product and category pages should emit dynamic metadata based on item/category content.
5. Social preview imagery should ideally use a dedicated `opengraph-image` asset rather than the site logo.
6. `NEXT_PUBLIC_SITE_URL` should be defined in every deployment environment.

## Accessibility Findings

### Fixed in this pass

1. Generic image alt text on marketing pages.
   - Action taken: replaced weak alt text with descriptive content.

2. Contact form labels were not explicitly connected to controls.
   - Action taken: added `htmlFor` and matching input ids.

3. Contact form did not surface submit errors in the UI.
   - Action taken: added inline error feedback.

### Remaining accessibility work

4. Dashboard image and modal components still have lint-reported image and alt issues.
5. Some dashboard fields misuse ARIA attributes.
6. Form semantics and focus states should be reviewed across basket, dashboard, and auth flows.

## Best-Practice Findings

### Current debt

1. `npm run lint` currently reports a large number of issues across the repo.
2. Several files still use `any` where domain types should exist.
3. Product filtering components use state-in-effect patterns that should be refactored.
4. At least one dashboard component has hook-order problems.

### Recommended remediation order

1. Fix hook-order and state-in-effect errors first.
2. Replace the highest-churn `any` types in shared lib and action code.
3. Remove low-value debug logs.
4. Finish dashboard accessibility cleanup.
5. Add targeted tests around auth transitions, guest merge behavior, and order ownership.

## Files Updated In This Audit Pass

- `.gitignore`
- `README.md`
- `next.config.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/(pages)/about/page.tsx`
- `src/app/(pages)/contact/page.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/components/contactForm/ContactForm.tsx`
- `src/lib/email/sendContactEmail.ts`
- `src/lib/email/sendOrderEmail.ts`

## Validation Status

- Metadata and hygiene fixes were applied.
- A full lint-clean repo was not completed in this pass.
- Follow-up validation should include `npm run lint` and `npm run build` after the broader lint backlog is addressed.