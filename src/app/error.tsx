'use client'

import { useEffect } from 'react'
import { logClientError } from '@/lib/logging/client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void logClientError('client.route.error', error, {
      digest: error.digest,
    })
  }, [error])

  return (
    <div className='mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-6 text-center'>
      <h2 className='text-2xl font-semibold text-rose-900'>Something went wrong</h2>
      <p className='mt-2 text-sm text-stone-600'>The issue has been logged. Please try again.</p>
      <button
        type='button'
        onClick={reset}
        className='mt-4 rounded-xl bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800'
      >
        Try again
      </button>
    </div>
  )
}