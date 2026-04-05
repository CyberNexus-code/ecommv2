'use server'

import { saveBusinessSettings } from '@/lib/businessSettings'

export type BusinessSettingsActionState = {
  success: boolean
  message: string | null
}

export async function updateBusinessSettingsAction(
  _prevState: BusinessSettingsActionState,
  formData: FormData,
): Promise<BusinessSettingsActionState> {
  try {
    const standardDeliveryRateValue = Number(formData.get('standard_delivery_rate') ?? '0')
    const productPriceReviewWindowValue = Number(formData.get('product_price_review_window_days') ?? '90')

    await saveBusinessSettings({
      business_name: String(formData.get('business_name') ?? ''),
      business_email: String(formData.get('business_email') ?? ''),
      business_phone: String(formData.get('business_phone') ?? ''),
      standard_delivery_rate: Number.isFinite(standardDeliveryRateValue) ? standardDeliveryRateValue : 0,
      product_price_review_window_days: Number.isFinite(productPriceReviewWindowValue) ? productPriceReviewWindowValue : 90,
      bank_account_name: String(formData.get('bank_account_name') ?? ''),
      bank_name: String(formData.get('bank_name') ?? ''),
      account_number: String(formData.get('account_number') ?? ''),
      branch_code: String(formData.get('branch_code') ?? ''),
      account_type: String(formData.get('account_type') ?? ''),
      payment_reference_prefix: String(formData.get('payment_reference_prefix') ?? ''),
      invoice_footer_note: String(formData.get('invoice_footer_note') ?? ''),
    })

    return {
      success: true,
      message: 'Banking, delivery, invoice, and product review settings saved.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to save business settings.',
    }
  }
}