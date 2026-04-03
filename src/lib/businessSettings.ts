import { revalidatePath } from 'next/cache'
import { createServer } from '@/lib/supabase/server'
import { logServerError } from '@/lib/logging/server'
import type { BusinessSettings } from '@/types/businessSettings'
import { DEFAULT_BUSINESS_SETTINGS } from '@/types/businessSettings'

type BusinessSettingsRow = Partial<BusinessSettings> & { id?: number }

function normalizeCurrencyValue(value: number | null | undefined, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.max(0, Number(value.toFixed(2)))
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const supabase = await createServer()
  const { data, error } = await supabase
    .from('business_settings')
    .select('id, business_name, business_email, business_phone, standard_delivery_rate, bank_account_name, bank_name, account_number, branch_code, account_type, payment_reference_prefix, invoice_footer_note')
    .eq('id', 1)
    .maybeSingle<BusinessSettingsRow>()

  if (error) {
    await logServerError('businessSettings.getBusinessSettings', error)
    return DEFAULT_BUSINESS_SETTINGS
  }

  return {
    ...DEFAULT_BUSINESS_SETTINGS,
    ...(data ?? {}),
    id: 1,
  }
}

export async function saveBusinessSettings(input: Partial<BusinessSettings>) {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden')
  }

  const payload = {
    id: 1,
    business_name: input.business_name?.trim() || DEFAULT_BUSINESS_SETTINGS.business_name,
    business_email: input.business_email?.trim() || null,
    business_phone: input.business_phone?.trim() || null,
    standard_delivery_rate: normalizeCurrencyValue(input.standard_delivery_rate, DEFAULT_BUSINESS_SETTINGS.standard_delivery_rate),
    bank_account_name: input.bank_account_name?.trim() || null,
    bank_name: input.bank_name?.trim() || null,
    account_number: input.account_number?.trim() || null,
    branch_code: input.branch_code?.trim() || null,
    account_type: input.account_type?.trim() || null,
    payment_reference_prefix: input.payment_reference_prefix?.trim() || DEFAULT_BUSINESS_SETTINGS.payment_reference_prefix,
    invoice_footer_note: input.invoice_footer_note?.trim() || DEFAULT_BUSINESS_SETTINGS.invoice_footer_note,
  }

  const { error } = await supabase.from('business_settings').upsert(payload, { onConflict: 'id' })

  if (error) {
    await logServerError('businessSettings.saveBusinessSettings', error, { userId: user.id })
    throw new Error('Unable to save business settings')
  }

  revalidatePath('/dashboard/accounting')
}