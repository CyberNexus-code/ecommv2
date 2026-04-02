'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logClientError } from '@/lib/logging/client'

export default function AuthFinalizePage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const safeNext = next.startsWith('/') ? next : '/'

  useEffect(() => {
    let active = true

    async function finalize() {
      if (code) {
        const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (!active) return

        if (exchangeError) {
          void logClientError('auth.finalize.exchangeCodeForSession', exchangeError, {
            safeNext,
            hasCode: true,
          })
        }

        if (exchangeData.session?.user && !exchangeData.session.user.is_anonymous) {
          redirectedRef.current = true
          router.replace(safeNext)
          router.refresh()
          return
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession()

      if (!active) return

      if (sessionError) {
        void logClientError('auth.finalize.getSession', sessionError, { safeNext })
      }

      if (data.session?.user && !data.session.user.is_anonymous) {
        redirectedRef.current = true
        router.replace(safeNext)
        router.refresh()
      }
    }

    void finalize()

    const timeoutId = window.setTimeout(() => {
      if (!redirectedRef.current && active) {
        setError('Sign in took longer than expected. Please try again.')
      }
    }, 5000)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active || redirectedRef.current) {
        return
      }

      if (session?.user && !session.user.is_anonymous) {
        redirectedRef.current = true
        window.clearTimeout(timeoutId)
        router.replace(safeNext)
        router.refresh()
      }
    })

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [code, router, safeNext, supabase])

  return (
    <div className="flex min-h-dvh items-start justify-center overflow-y-auto p-3 md:px-6 md:py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-rose-700">Finishing Sign In</h1>
        <p className="text-sm text-stone-600">
          Finalizing your Google session and restoring your account.
        </p>
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