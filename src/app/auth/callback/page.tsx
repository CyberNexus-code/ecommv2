'use client'

/**
 * =====================================================================
 * AUTH CALLBACK PAGE — OAuth / PKCE completion endpoint
 * =====================================================================
 *
 * PURPOSE
 * -------
 * This is the browser-side page that Supabase redirects to after a
 * successful OAuth provider consent (Google, Facebook, etc.).
 * It is also the target when /auth/confirm forwards a PKCE `code`
 * parameter from email-based flows (signup confirmation, magic link).
 *
 * FULL AUTH FLOW (OAuth / PKCE)
 * -----------------------------
 * 1. User clicks "Continue with Google" on /login or /signup.
 * 2. startOAuthSignIn() (src/lib/auth/oauth.ts):
 *    a. Saves the anonymous guest user ID to localStorage via
 *       rememberPendingGuestMerge() so the basket can be merged later.
 *    b. Signs out the current (anonymous) session.
 *    c. Calls supabase.auth.signInWithOAuth() with:
 *       - provider: 'google' (or 'facebook')
 *       - redirectTo: <origin>/auth/callback?next=<safeNext>
 *       - queryParams: { access_type: 'offline', prompt: 'select_account consent' }
 *    d. The browser Supabase client stores a PKCE code_verifier in cookies
 *       (via @supabase/ssr cookie storage).
 *    e. The browser is redirected to Supabase Auth → Google consent.
 * 3. After consent, Supabase Auth redirects to:
 *    <origin>/auth/callback?code=<auth_code>&next=<safeNext>
 * 4. THIS PAGE loads. The singleton browser Supabase client initialises
 *    and detects ?code= in the URL (detectSessionInUrl: true).
 *    During initialization it automatically:
 *    a. Reads the PKCE code_verifier from cookies.
 *    b. Calls POST /token?grant_type=pkce with code + code_verifier.
 *    c. Saves the resulting session to cookies.
 *    d. Fires the SIGNED_IN auth state change event.
 *    e. Removes ?code= from the URL via history.replaceState.
 * 5. completeAuth() awaits supabase.auth.initialize(), then reads the
 *    session via getSession(). If valid and non-anonymous:
 *    a. Persists Google OAuth tokens to the DB via /api/auth/oauth-tokens.
 *    b. Redirects to safeNext (or /).
 * 6. AuthProvider (src/lib/auth/context.tsx) picks up SIGNED_IN, resolves
 *    the user role from profiles, and calls merge_guest_account_data RPC
 *    to merge the old anonymous basket into the new user.
 *
 * CRITICAL CAVEAT — DO NOT CALL exchangeCodeForSession() MANUALLY
 * ---------------------------------------------------------------
 * @supabase/ssr's createBrowserClient sets:
 *   - flowType: 'pkce'
 *   - detectSessionInUrl: true
 *
 * This means the client AUTOMATICALLY exchanges the ?code= parameter
 * during its initialization. The code_verifier cookie is consumed and
 * deleted after the first exchange. If you call exchangeCodeForSession()
 * manually AFTER that, it will fail with AuthPKCECodeVerifierMissingError
 * because the verifier no longer exists. This was the root cause of
 * the "We could not complete sign in" error in production.
 *
 * AUTH FLOW (Email confirmation / OTP)
 * ------------------------------------
 * Email confirmation links hit /auth/confirm (server Route Handler) which:
 * - OTP: verifies via verifyOtp() server-side, redirects to next.
 * - PKCE code: redirects to THIS page with ?code=&next= for browser
 *   exchange (same flow as OAuth step 4 onwards).
 *
 * GUEST SESSION & BASKET MERGE
 * ----------------------------
 * - AppShell excludes auth paths from <AuthProvider>, so no guest
 *   session is created while this page runs (isAuthPath returns true
 *   for /auth/*).
 * - The anonymous user ID was saved to localStorage before OAuth redirect.
 * - After the user lands back in the app (non-auth path), AuthProvider
 *   picks up the SIGNED_IN event, reads the pending guest merge ID from
 *   localStorage, and calls merge_guest_account_data RPC.
 *
 * PROVIDER TOKEN PERSISTENCE
 * --------------------------
 * Google OAuth tokens (access_token, refresh_token) are only available
 * in the session object immediately after the PKCE exchange. Supabase
 * does not store them in its DB. We extract them via getOAuthTokenPayload()
 * and POST to /api/auth/oauth-tokens, which upserts into the
 * oauth_provider_tokens table. This is non-critical; failures don't
 * block sign-in.
 *
 * FILES IN THE AUTH SYSTEM
 * ------------------------
 * - src/lib/auth/paths.ts          — isAuthPath, sanitizeNextPath, buildAuthCallbackUrl
 * - src/lib/auth/oauth.ts          — startOAuthSignIn, provider config, guest merge bookkeeping
 * - src/lib/auth/oauthTokens.ts    — getOAuthTokenPayload (extracts Google tokens from session)
 * - src/lib/auth/context.tsx        — AuthProvider: guest bootstrap, role resolution, basket merge
 * - src/lib/auth/pendingGuestMerge.ts — localStorage helpers for guest user ID
 * - src/lib/supabase/client.ts      — singleton browser Supabase client (createBrowserClient)
 * - src/lib/supabase/server.ts      — server Supabase client (createServerClient with cookies)
 * - src/lib/supabase/proxy.ts       — Next.js Proxy (replaces middleware) for session refresh
 * - src/proxy.ts                    — Proxy entry point (matcher config)
 * - src/app/auth/confirm/route.ts   — Server route for email OTP / PKCE code forwarding
 * - src/app/api/auth/oauth-tokens/route.ts — Server API to persist provider tokens
 * - src/components/AppShell.tsx      — Wraps non-auth pages in AuthProvider
 *
 * SUPABASE DASHBOARD SETTINGS (production)
 * ----------------------------------------
 * - Site URL: https://cuteandcreativeco.co.za
 * - Redirect URLs must include: https://cuteandcreativeco.co.za/**
 * - Google OAuth provider enabled with access_type=offline scopes.
 * =====================================================================
 */

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logClientError } from '@/lib/logging/client'
import { sanitizeNextPath } from '@/lib/auth/paths'
import { getOAuthTokenPayload } from '@/lib/auth/oauthTokens'

export default function AuthCallbackPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const searchParams = useSearchParams()
  const handledRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const safeNext = sanitizeNextPath(searchParams.get('next'))

  useEffect(() => {
    if (handledRef.current) {
      return
    }

    handledRef.current = true

    async function completeAuth() {
      // The browser Supabase client (created by @supabase/ssr) has
      // detectSessionInUrl enabled. When the page loads with ?code=…,
      // the client automatically performs the PKCE code exchange during
      // its initialization. Calling exchangeCodeForSession manually
      // would race with that and fail because the code verifier is
      // consumed on the first exchange.
      //
      // We simply wait for initialization to finish and then check
      // whether a session was established.
      const { error: initError } = await supabase.auth.initialize()

      if (initError) {
        void logClientError('auth.callback.initialize', initError, { safeNext })
        setError('We could not complete sign in. Please try again.')
        return
      }

      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        void logClientError('auth.callback.getSession', sessionError, { safeNext })
        setError('We could not complete sign in. Please try again.')
        return
      }

      if (data.session?.user && !data.session.user.is_anonymous) {
        const tokenPayload = getOAuthTokenPayload(data.session)

        if (tokenPayload) {
          try {
            await fetch('/api/auth/oauth-tokens', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(tokenPayload),
            })
          } catch {
            // Non-critical – token persistence failures are logged server-side
          }
        }

        router.replace(safeNext)
        router.refresh()
        return
      }

      setError('We could not complete sign in. Please try again.')
    }

    void completeAuth()
  }, [router, safeNext, supabase])

  return (
    <div className="flex min-h-dvh items-start justify-center overflow-y-auto p-3 md:px-6 md:py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-rose-700">Finishing Sign In</h1>
        <p className="text-sm text-stone-600">Finalizing your account and returning you to the shop.</p>
        {error ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            <Link href="/login" className="inline-flex rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800">
              Back to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-rose-200 border-t-rose-700" />
            <p className="text-sm text-stone-500">Please wait...</p>
          </div>
        )}
      </div>
    </div>
  )
}