export function isAuthPath(pathname: string | null) {
  return (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/update-password' ||
    pathname?.startsWith('/auth/')
  )
}

export function sanitizeNextPath(next: string | null | undefined) {
  return next && next.startsWith('/') ? next : '/'
}

export function buildAuthCallbackUrl(origin: string, next: string | null | undefined) {
  const safeNext = sanitizeNextPath(next)
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`
}