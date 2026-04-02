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
import { isAuthPath } from '@/lib/auth/paths'
import { createClient } from '@/lib/supabase/client'
import { logClientError } from '@/lib/logging/client'
import { clearPendingGuestMerge, getPendingGuestMergeUserId } from '@/lib/auth/pendingGuestMerge'
import type { AuthContextType, AuthRole } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<AuthRole>('guest')
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const lastMergedGuestUserId = useRef<string | null>(null)
  const isSigningOut = useRef(false)
  const guestSessionPromiseRef = useRef<Promise<User | null> | null>(null)

  useEffect(() => {
    let active = true

    async function resolveRole(nextUser: User | null) {
      if (!active) return

      if (!nextUser || nextUser.is_anonymous) {
        setRole('guest')
        setDisplayName(null)
        return
      }

      type ProfileSummary = {
        role: AuthRole | null
        username: string | null
        first_name: string | null
        last_name: string | null
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role, username, first_name, last_name')
        .eq('id', nextUser.id)
        .maybeSingle<ProfileSummary>()

      if (!active) return

      const fallbackName = nextUser.email?.split('@')[0] ?? 'there'

      if (error) {
        void logClientError('auth.resolveRole', error, { userId: nextUser.id, pathname })
        setRole('client')
        setDisplayName(fallbackName)
        return
      }

      const fullName = [data?.first_name, data?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim()

      setRole(data?.role === 'admin' ? 'admin' : 'client')
      setDisplayName(fullName || data?.username || fallbackName)
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

    async function syncAuthState(nextUser: User | null) {
      if (!active) {
        return
      }

      setUser(nextUser)
      await resolveRole(nextUser)

      if (nextUser && !nextUser.is_anonymous) {
        await mergePendingGuestData(nextUser)
      }
    }

    async function ensureGuestSession(reason: string) {
      if (!active || isAuthPath(pathname) || isSigningOut.current) {
        return null
      }

      const { data: current, error: currentError } = await supabase.auth.getSession()

      if (!active) {
        return null
      }

      if (currentError) {
        void logClientError('auth.ensureGuestSession.getSession', currentError, { pathname, reason })
      }

      const currentUser = current.session?.user ?? null

      if (currentUser) {
        return currentUser
      }

      if (!guestSessionPromiseRef.current) {
        guestSessionPromiseRef.current = (async () => {
          const { data: anonymousData, error: anonymousError } = await supabase.auth.signInAnonymously()

          if (anonymousError) {
            void logClientError('auth.ensureGuestSession.signInAnonymously', anonymousError, { pathname, reason })
            return null
          }

          return anonymousData.user ?? anonymousData.session?.user ?? null
        })().finally(() => {
          guestSessionPromiseRef.current = null
        })
      }

      return guestSessionPromiseRef.current
    }

    async function hydrateSession(reason: string) {
      const { data, error } = await supabase.auth.getSession()

      if (!active) return

      if (error) {
        void logClientError('auth.hydrateSession.getSession', error, { pathname, reason })
      }

      let nextUser = data.session?.user ?? null

      if (!nextUser && !isAuthPath(pathname) && !isSigningOut.current) {
        nextUser = await ensureGuestSession(reason)
      }

      await syncAuthState(nextUser)

      if (active) {
        setLoading(false)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return

      if (event === 'SIGNED_OUT') {
        lastMergedGuestUserId.current = null
      }

      let nextUser = session?.user ?? null

      if (!nextUser && !isAuthPath(pathname) && !isSigningOut.current) {
        nextUser = await ensureGuestSession(`auth:${event}`)
      }

      await syncAuthState(nextUser)

      if (active) {
        setLoading(false)
      }
    })

    void hydrateSession('initial')

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

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        void logClientError('auth.signOut', signOutError, { pathname })
        return
      }

      setUser(null)
      setRole('guest')
      setDisplayName(null)

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

      router.replace('/')
      router.refresh()
    } catch (error) {
      void logClientError('auth.signOut.unexpected', error, { pathname })
    } finally {
      isSigningOut.current = false
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        displayName,
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