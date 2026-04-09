'use client'

import Link from 'next/link'
import { useState, useActionState } from 'react'
import { placeOrder } from '@/app/_actions/basketActions'
import ButtonRose from '@/components/ui/button'

type PlaceOrderFormProps = {
  basketId: string
}

export default function PlaceOrderForm({ basketId }: PlaceOrderFormProps) {
  const [recipientDate, setRecipientDate] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAge, setRecipientAge] = useState("");
  const [comments, setComments] = useState("");
  const [hasConfirmedCheckout, setHasConfirmedCheckout] = useState(false);
  const [inlineErrors, setInlineErrors] = useState<{[key:string]:string}>({});
  const [state, formAction, pending] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      await placeOrder(formData)
      // Reset form fields on success
      setRecipientDate("");
      setRecipientName("");
      setRecipientAge("");
      setComments("");
      setHasConfirmedCheckout(false);
      return { error: null, success: true };
    } catch (err: any) {
      // On error, repopulate state from formData
      setRecipientDate(formData.get("recipient_date") as string || "");
      setRecipientName(formData.get("recipient_name") as string || "");
      setRecipientAge(formData.get("recipient_age") as string || "");
      setComments(formData.get("comments") as string || "");
      setHasConfirmedCheckout(formData.get("checkout_confirmation") === "accepted");
      return { error: err.message || 'An error occurred.', success: false };
    }
  }, { error: null, success: false })

  function validateInline() {
    const errors: {[key:string]:string} = {};
    if (!recipientDate) errors.recipientDate = "Date is required.";
    if (!recipientName || recipientName.length < 2) errors.recipientName = "Recipient name must be at least 2 characters.";
    if (!recipientAge || isNaN(Number(recipientAge)) || Number(recipientAge) < 0) errors.recipientAge = "Recipient age must be a valid number.";
    return errors;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const errors = validateInline();
    setInlineErrors(errors);
    if (Object.keys(errors).length > 0) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} className="w-full space-y-3" onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="basket_id" value={basketId} />

      {state.success && !state.error && (
        <div className="rounded bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-2 mb-2 text-center font-semibold">
          Order placed successfully! You will receive a confirmation email shortly.
        </div>
      )}
      {state.error && (
        <div className="rounded bg-rose-100 border border-rose-300 text-rose-800 px-4 py-2 mb-2 space-y-2">
          <div>{state.error}</div>
          {state.error.includes('minimum') && state.error.includes('days') && (
            <div className="flex flex-col gap-2">
              <span>
                Alternatively, submit a request via Contact Us if you need your order sooner.
              </span>
              <Link href="/contact" className="inline-block">
                <ButtonRose type="button" variant="secondary1">
                  Contact Us
                </ButtonRose>
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="recipient_date" className="block text-sm font-medium text-stone-700">
          Date <span className="text-rose-700 font-bold">*</span>
        </label>
        <input
          id="recipient_date"
          type="date"
          name="recipient_date"
          required
          value={recipientDate}
          onChange={e => setRecipientDate(e.target.value)}
          className="mt-1 block w-full rounded border border-rose-300 px-3 py-2 text-stone-900 focus:border-rose-400 focus:ring-rose-400"
          aria-invalid={!!inlineErrors.recipientDate}
          aria-describedby={inlineErrors.recipientDate ? 'recipient-date-error' : undefined}
        />
        {inlineErrors.recipientDate && (
          <span id="recipient-date-error" className="text-xs text-rose-700 font-semibold" role="alert">{inlineErrors.recipientDate}</span>
        )}
        <label htmlFor="recipient_name" className="block text-sm font-medium text-stone-700">
          Recipient Name <span className="text-rose-700 font-bold">*</span>
        </label>
        <input
          id="recipient_name"
          type="text"
          name="recipient_name"
          required
          minLength={2}
          value={recipientName}
          onChange={e => setRecipientName(e.target.value)}
          className="mt-1 block w-full rounded border border-rose-300 px-3 py-2 text-stone-900 focus:border-rose-400 focus:ring-rose-400"
          aria-invalid={!!inlineErrors.recipientName}
          aria-describedby={inlineErrors.recipientName ? 'recipient-name-error' : undefined}
        />
        {inlineErrors.recipientName && (
          <span id="recipient-name-error" className="text-xs text-rose-700 font-semibold" role="alert">{inlineErrors.recipientName}</span>
        )}
        <label htmlFor="recipient_age" className="block text-sm font-medium text-stone-700">
          Recipient Age <span className="text-rose-700 font-bold">*</span>
        </label>
        <input
          id="recipient_age"
          type="number"
          name="recipient_age"
          required
          min={0}
          max={120}
          value={recipientAge}
          onChange={e => setRecipientAge(e.target.value)}
          className="mt-1 block w-full rounded border border-rose-300 px-3 py-2 text-stone-900 focus:border-rose-400 focus:ring-rose-400"
          aria-invalid={!!inlineErrors.recipientAge}
          aria-describedby={inlineErrors.recipientAge ? 'recipient-age-error' : undefined}
        />
        {inlineErrors.recipientAge && (
          <span id="recipient-age-error" className="text-xs text-rose-700 font-semibold" role="alert">{inlineErrors.recipientAge}</span>
        )}
        <label htmlFor="comments" className="block text-sm font-medium text-stone-700">
          Comments
        </label>
        <textarea
          id="comments"
          name="comments"
          rows={3}
          value={comments}
          onChange={e => setComments(e.target.value)}
          className="mt-1 block w-full rounded border border-rose-300 px-3 py-2 text-stone-900 focus:border-rose-400 focus:ring-rose-400"
          placeholder="Add any special instructions or comments (optional)"
        />
      </div>

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
        loading={pending}
        disabled={!hasConfirmedCheckout || pending}
        className="w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-50"
      >
        Place Order
      </ButtonRose>
    </form>
  )
}