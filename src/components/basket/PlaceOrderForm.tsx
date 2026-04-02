'use client'

import Link from 'next/link'
import { useState } from 'react'
import { placeOrder } from '@/app/_actions/basketActions'
import ButtonRose from '@/components/ui/button'

type PlaceOrderFormProps = {
  basketId: string
}

export default function PlaceOrderForm({ basketId }: PlaceOrderFormProps) {
  const [hasConfirmedCheckout, setHasConfirmedCheckout] = useState(false)

  return (
    <form action={placeOrder} className="w-full space-y-3">
      <input type="hidden" name="basket_id" value={basketId} />
      <label className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-3 text-sm leading-5 text-stone-700">
        <input
          className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-700 focus:ring-rose-400"
          type="checkbox"
          name="checkout_confirmation"
          value="accepted"
          checked={hasConfirmedCheckout}
          onChange={(event) => setHasConfirmedCheckout(event.target.checked)}
          required
        />
        <span>
          I confirm that my delivery address is accurate and complete, and I accept the{' '}
          <Link href="/terms-of-service" className="font-medium text-rose-700 underline underline-offset-2 hover:text-rose-800">
            Terms of Service
          </Link>
          .
        </span>
      </label>
      <ButtonRose
        type="submit"
        variant="primary"
        disabled={!hasConfirmedCheckout}
        className="w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-50"
      >
        Place Order
      </ButtonRose>
    </form>
  )
}