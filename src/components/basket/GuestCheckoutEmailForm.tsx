'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { saveGuestCheckoutEmail, type GuestCheckoutEmailState } from '@/app/_actions/basketActions'
import ButtonRose from '@/components/ui/button'

type GuestCheckoutEmailFormProps = {
  profileId: string
  initialEmail: string
  requiresSignIn: boolean
}

const initialGuestCheckoutEmailState: GuestCheckoutEmailState = {
  success: false,
  error: null,
  accountExists: false,
  email: '',
}

export default function GuestCheckoutEmailForm({ profileId, initialEmail, requiresSignIn }: GuestCheckoutEmailFormProps) {
  const [state, action, pending] = useActionState(saveGuestCheckoutEmail, initialGuestCheckoutEmailState)
  const showSignInPrompt = requiresSignIn || state.accountExists

  return (
    <div className='space-y-3'>
      <form action={action} className='space-y-2'>
        <p className='text-xs text-stone-600'>Use an email address for receipts and order updates.</p>
        <div className='my-2'>
          <input
            className='w-full rounded-md border border-rose-200 p-2 focus:border-rose-400 focus:outline-none'
            type='email'
            name='email'
            aria-label='Order contact email'
            placeholder='john@mail.com'
            defaultValue={state.email || initialEmail}
            required
          />
          <input type='hidden' name='id' value={profileId} />
        </div>
        <ButtonRose type='submit' variant='secondary1' loading={pending}>
          Save Email
        </ButtonRose>
      </form>

      {state.error ? (
        <p className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
          {state.error}
        </p>
      ) : null}

      {state.success && !showSignInPrompt ? (
        <p className='rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800'>
          Order contact email saved.
        </p>
      ) : null}

      {showSignInPrompt ? (
        <div className='rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900'>
          <p className='font-medium'>This email already belongs to an account.</p>
          <p className='mt-1'>Sign in to merge this guest basket into that account before you continue, or save a different contact email to keep checking out as a guest.</p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <Link href='/login?next=/basket' className='inline-flex rounded-md bg-rose-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-800'>
              Sign In To Merge Basket
            </Link>
            <Link href='/signup?next=/basket' className='inline-flex rounded-md border border-rose-300 px-3 py-2 text-sm font-medium text-rose-800 transition hover:bg-white'>
              Create Account Instead
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}