'use client'

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