# Authentication Setup Guide

This guide covers the configuration needed for password reset functionality and the Google OAuth provider in your eCommerce application.

## Overview

✅ **Implemented:**
- Password reset flow (forgot-password page with email sending)
- Password reset via email link (reset-password page)
- Google OAuth provider buttons on login/signup pages
- OAuth callback handler (`/auth/callback`)

⚠️ **Requires Manual Configuration:**
1. Supabase OAuth provider setup (Google)
2. Email authentication configuration
3. Production environment variables

---

## Part 1: Password Reset & Email Configuration

### Prerequisites
- Supabase project (hosted or local)
- Email delivery configured for your environment

### Local Development (Using Inbucket)

The local Supabase setup includes **Inbucket**, an email testing service that captures emails without actually sending them.

1. **Verify Inbucket is enabled in `supabase/config.toml`:**
   ```toml
   [inbucket]
   enabled = true
   port = 54324
   ```

2. **Start the Supabase local development:**
   ```powershell
   supabase start
   ```

3. **Access Inbucket email interface:**
   - Open http://localhost:54324 in your browser
   - Any emails sent (password resets, confirmations, etc.) will appear here

### Production Setup with Supabase Hosted

In your Supabase dashboard (https://supabase.com):

1. **Navigate to Authentication > Email Templates**
2. **Enable Email Confirmations** (if desired):
   - Go to Authentication > Providers > Email
   - Toggle "Confirm email" if you want users to verify emails before signup
   - Customize the confirmation email template
3. **Customize Password Reset Email**:
   - Go to Authentication > Email Templates
   - Edit the password reset email template
   - Ensure the magic link includes the reset token

**Current email configuration** (`supabase/config.toml`):
```toml
[auth.email]
enable_signup = true
enable_confirmations = false           # Users don't need to confirm email
double_confirm_changes = true          # Must confirm email changes on both addresses
secure_password_change = false         # Can change password without recent login
max_frequency = "1s"                   # Rate limit: 1 second between emails
otp_length = 6                         # OTP code length
otp_expiry = 3600                      # OTP valid for 1 hour
```

---

## Part 2: Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create a new project** (or select existing):
   - Name: "Cute & Creative Toppers" (or your app name)
3. **Enable Google+ API**:
   - Search for "Google+ API" in the search bar
   - Click "Enable"
4. **Create OAuth 2.0 Credentials**:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Name it: "Cute & Creative Toppers - Web"

### Step 2: Configure Authorized Redirect URIs

In the Google Cloud Console credentials:

**For Local Development**, add:
```
http://localhost:3000/auth/callback
http://localhost:54321/auth/v1/callback
```

**For Production**, add:
```
https://yoursite.com/auth/callback
https://project-ref.supabase.co/auth/v1/callback
```

### Step 3: Add to Supabase

**Local Development** (`supabase/config.toml`):
```toml
[auth.external.google]
enabled = true
client_id = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
skip_nonce_check = true  # Required for local development
```

**Environment Variable**:
```powershell
# In your terminal, set the secret
$env:SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET = "YOUR_GOOGLE_CLIENT_SECRET"
```

**Production Setup** (Supabase Dashboard):
1. Go to Authentication > Providers > Google
2. Enable Google
3. Paste your Client ID and Client Secret
4. Save

---

## Part 3: Environment Variables

### Local Development

Create or update `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_local_publishable_key
```

Set OAuth secrets in your terminal before running the dev server:

```powershell
$env:SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET = "your_google_secret"
```

### Production

In Vercel/your hosting platform, set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_production_publishable_key
```

*(No need for OAuth secrets in production env vars - they're managed in Supabase dashboard)*

---

## Part 4: Testing the Implementation

### Test Password Reset Flow

1. **Start the dev server**:
   ```powershell
   npm run dev
   ```

2. **Go to login page**:
   - Click "Forgot password?"
   - Enter an email and submit
   - Check Inbucket (http://localhost:54324) for the reset email
   - Click the reset link
   - Set a new password

### Test Google OAuth

1. **Go to login or signup page**
2. **Click "Continue with Google"**
3. **Sign in with a Google account**
4. You should be redirected back to the app

## Supabase Auth Configuration Summary

Current settings in `supabase/config.toml`:

```toml
[auth]
enabled = true
site_url = "http://127.0.0.1:3000"
additional_redirect_urls = ["https://127.0.0.1:3000"]
jwt_expiry = 3600                           # 1 hour
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10
enable_signup = true
enable_anonymous_sign_ins = false           # Disabled in config
minimum_password_length = 6
```

**Note:** The code currently has `enable_anonymous_sign_ins = false`, but the `AuthComponent` still signs in anonymous users. To fully disable anonymous sign-ins, update the code or toggle this setting.

---

## Implementation Files Modified

1. ✅ `src/app/(pages)/(auth)/forgot-password/page.tsx` - Now sends password reset emails
2. ✅ `src/app/(pages)/(auth)/reset-password/page.tsx` - Now handles password reset via email link
3. ✅ `src/app/(pages)/(auth)/login/page.tsx` - Added Google & Facebook OAuth buttons
4. ✅ `src/app/(pages)/(auth)/signup/page.tsx` - Added Google & Facebook OAuth buttons
5. ✅ `src/app/auth/confirm/route.ts` - Already configured for OAuth callbacks

---

## Troubleshooting

### Password reset email not sending

**Local dev:**
- Ensure Inbucket is running: `supabase start`
- Check http://localhost:54324 for emails
- Verify `max_frequency` isn't rate-limiting you

**Production:**
- Check Supabase dashboard > Auth > Email Templates
- Verify SMTP credentials if using custom SMTP
- Check email bounce/spam rates in Supabase logs

### OAuth buttons not working

1. **Check browser console** for error messages
2. **Verify redirect URLs**:
   - Must match exactly in OAuth provider (Google/Facebook)
   - Must include port for localhost
3. **Verify credentials** in `config.toml` or Supabase dashboard
4. **Check `skip_nonce_check = true`** for Google in local dev

### "Invalid or expired reset link"

- Email link may be expired (default: 1 hour)
- User may have changed email since requesting reset
- User may need to request a new reset link

---

## Production Checklist

Before deploying to production:

- [ ] Google OAuth credentials created and added to Supabase
- [ ] Environment variables set in Vercel/hosting platform
- [ ] Redirect URLs updated to production domain
- [ ] Email SMTP configured in Supabase (if using custom provider)
- [ ] Test password reset flow with production email
- [ ] Test OAuth login with Google
- [ ] Verify anonymous sign-ins are desired behavior (currently enabled)

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Facebook OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Google Cloud Console](https://console.cloud.google.com)
- [Facebook Developers](https://developers.facebook.com)
