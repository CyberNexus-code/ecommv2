'use client'

import { useActionState } from 'react'
import { updateBusinessSettingsAction, type BusinessSettingsActionState } from '@/app/_actions/businessSettingsActions'
import ButtonRose from '@/components/ui/button'
import type { BusinessSettings } from '@/types/businessSettings'

const initialState: BusinessSettingsActionState = {
  success: false,
  message: null,
}

type BankingDetailsFormProps = {
  settings: BusinessSettings
}

export default function BankingDetailsForm({ settings }: BankingDetailsFormProps) {
  const [state, action, pending] = useActionState(updateBusinessSettingsAction, initialState)

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Invoice Settings</p>
        <h2 className="mt-1 text-xl font-semibold text-rose-900">Business and Banking Details</h2>
        <p className="mt-1 text-sm text-stone-600">These details are used in customer invoices, delivery totals, and accounting exports.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>Business Name</span>
          <input name="business_name" defaultValue={settings.business_name} className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>Business Email</span>
          <input name="business_email" defaultValue={settings.business_email} className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>Business Phone</span>
          <input name="business_phone" defaultValue={settings.business_phone} className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>Standard Delivery Rate</span>
          <input
            name="standard_delivery_rate"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.standard_delivery_rate}
            className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>Payment Reference Prefix</span>
          <input name="payment_reference_prefix" defaultValue={settings.payment_reference_prefix} className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>Bank Name</span>
          <input name="bank_name" defaultValue={settings.bank_name} className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>Account Name</span>
          <input name="bank_account_name" defaultValue={settings.bank_account_name} className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>Account Number</span>
          <input name="account_number" defaultValue={settings.account_number} className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>Branch Code</span>
          <input name="branch_code" defaultValue={settings.branch_code} className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700 md:col-span-2">
          <span>Account Type</span>
          <input name="account_type" defaultValue={settings.account_type} className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700 md:col-span-2">
          <span>Invoice Footer Note</span>
          <textarea name="invoice_footer_note" defaultValue={settings.invoice_footer_note} rows={3} className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm" />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm ${state.success ? 'text-emerald-700' : 'text-rose-700'}`}>
          {state.message ?? 'Save changes to update delivery, invoice, and banking details.'}
        </p>
        <ButtonRose type="submit" variant="primary" loading={pending}>Save Banking Details</ButtonRose>
      </div>
    </form>
  )
}