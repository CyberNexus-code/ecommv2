'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { logClientError } from '@/lib/logging/client'
import { clearPendingGuestMerge, getPendingGuestMergeUserId } from '@/lib/auth/pendingGuestMerge'
import type { AuthContextType, AuthRole } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function isAuthPath(pathname: string | null) {
  return (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/update-password' ||
    pathname?.startsWith('/auth/')
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<AuthRole>('guest')
  const [loading, setLoading] = useState(true)
  const lastMergedGuestUserId = useRef<string | null>(null)
  const isSigningOut = useRef(false)

  useEffect(() => {
    let active = true

    async function resolveRole(nextUser: User | null) {
      if (!active) return

      if (!nextUser || nextUser.is_anonymous) {
        setRole('guest')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', nextUser.id)
        .maybeSingle()

      if (!active) return

      if (error) {
        void logClientError('auth.resolveRole', error, { userId: nextUser.id, pathname })
        setRole('client')
        return
      }

      setRole(data?.role === 'admin' ? 'admin' : 'client')
    }

    async function mergePendingGuestData(nextUser: User | null) {
      if (!active || !nextUser || nextUser.is_anonymous) {
        return
      }

      const pendingGuestUserId = getPendingGuestMergeUserId()

      if (!pendingGuestUserId || pendingGuestUserId === nextUser.id || lastMergedGuestUserId.current === pendingGuestUserId) {
        if (pendingGuestUserId === nextUser.id) {
          clearPendingGuestMerge()
        }

        return
      }

      const { error } = await supabase.rpc('merge_guest_account_data', {
        p_guest_user_id: pendingGuestUserId,
      })

      if (error) {
        void logClientError('auth.mergePendingGuestData', error, { pendingGuestUserId, pathname })
        clearPendingGuestMerge()
        return
      }

      lastMergedGuestUserId.current = pendingGuestUserId
      clearPendingGuestMerge()
      router.refresh()
    }

    async function ensureSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!active) return

      if (error) {
        void logClientError('auth.ensureSession.getSession', error, { pathname })
      }

      let nextUser = data.session?.user ?? null

      if (!nextUser && !isAuthPath(pathname) && !isSigningOut.current) {
        const { data: anonymousData, error: anonymousError } = await supabase.auth.signInAnonymously()

        if (!active) return

        if (anonymousError) {
          void logClientError('auth.ensureSession.signInAnonymously', anonymousError, { pathname })
        } else {
          nextUser = anonymousData.user ?? anonymousData.session?.user ?? null
        }
      }

      setUser(nextUser)
      await resolveRole(nextUser)
      await mergePendingGuestData(nextUser)
      if (active) {
        setLoading(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return

      const nextUser = session?.user ?? null
      setUser(nextUser)
      await resolveRole(nextUser)
      await mergePendingGuestData(nextUser)

      if (!nextUser && !isAuthPath(pathname) && !isSigningOut.current) {
        const { data: anonymousData, error: anonymousError } = await supabase.auth.signInAnonymously()

        if (!active) return

        if (anonymousError) {
          void logClientError('auth.onAuthStateChange.restoreGuestSession', anonymousError, { pathname })
        } else {
          const guestUser = anonymousData.user ?? anonymousData.session?.user ?? null
          setUser(guestUser)
          await resolveRole(guestUser)
        }
      }

      if (active) {
        setLoading(false)
      }
    })

    ensureSession()

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [pathname, router, supabase])

  const signOut = async () => {
    setLoading(true)
    isSigningOut.current = true
    clearPendingGuestMerge()
    lastMergedGuestUserId.current = null

    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      void logClientError('auth.signOut', signOutError, { pathname })
      isSigningOut.current = false
      setLoading(false)
      return
    }

    setUser(null)
    setRole('guest')

    if (!isAuthPath(pathname)) {
      const { data: anonymousData, error: anonymousError } = await supabase.auth.signInAnonymously()

      if (anonymousError) {
        void logClientError('auth.signOut.restoreGuestSession', anonymousError, { pathname })
      } else {
        const guestUser = anonymousData.user ?? anonymousData.session?.user ?? null
        setUser(guestUser)
        setRole('guest')
      }
    }

    isSigningOut.current = false
    setLoading(false)
    router.replace('/')
    router.refresh()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated: !!user && !user.is_anonymous,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}