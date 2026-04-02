# Post-Deploy Checklist

Use this after each deployment to Vercel or any other host.

## Storefront

1. Open the home page and confirm branding, hero content, and navigation load correctly.
2. Open `/products` and one category page and confirm products, search, filters, and product images load.
3. Open one product detail page and confirm gallery, lightbox, related products, and add-to-basket work.
4. Add and remove basket items and confirm totals update.

## Auth

1. Sign up with a test account.
2. Log in with email/password.
3. Test logout.
4. Trigger forgot-password and confirm the reset email flow works.
5. If OAuth is enabled, test Google and Facebook login.

## Orders

1. Complete a guest order-placement flow.
2. Complete a signed-in order-placement flow.
3. Confirm order records appear in the account orders page.
4. Confirm admin can see the order in `/dashboard/orders`.
5. Confirm contact/order emails are sent successfully.

## Admin

1. Open `/dashboard` and confirm overview metrics load.
2. Create, edit, and delete a category.
3. Create or edit a product.
4. Upload images, set thumbnail, and edit alt text.
5. Confirm tags can be created and assigned.

## SEO And Ops

1. Confirm `robots.txt` loads.
2. Confirm `sitemap.xml` loads.
3. Confirm `NEXT_PUBLIC_SITE_URL` matches the deployed domain.
4. Check Supabase logs and application logs for fresh errors after smoke testing.

## Log Review

1. Confirm new application logs are being written to `public.app_logs`.
2. Confirm no unexpected spike in `error` level logs after deployment.
3. Confirm retention cleanup job exists and is scheduled.