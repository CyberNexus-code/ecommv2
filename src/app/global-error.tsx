'use client'

import { useEffect } from 'react'
import { logClientError } from '@/lib/logging/client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void logClientError('client.global.error', error, {
      digest: error.digest,
    })
  }, [error])

  return (
    <html lang='en'>
      <body className='flex min-h-screen items-center justify-center bg-rose-50 px-6'>
        <div className='max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm'>
          <h1 className='text-2xl font-semibold text-rose-900'>Application error</h1>
          <p className='mt-2 text-sm text-stone-600'>A fatal error occurred and has been logged.</p>
          <button
            type='button'
            onClick={reset}
            className='mt-4 rounded-xl bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800'
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}