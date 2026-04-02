'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { logClientError } from '@/lib/logging/client'

export default function ClientLogger() {
  const pathname = usePathname()

  useEffect(() => {
    function handleError(event: ErrorEvent) {
      void logClientError('client.window.error', event.error ?? event.message, {
        pathname,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
      })
    }

    function handleRejection(event: PromiseRejectionEvent) {
      void logClientError('client.window.unhandledrejection', event.reason, {
        pathname,
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [pathname])

  return null
}