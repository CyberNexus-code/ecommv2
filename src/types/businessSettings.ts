export type BusinessSettings = {
  id: number
  business_name: string
  business_email: string
  business_phone: string
  bank_account_name: string
  bank_name: string
  account_number: string
  branch_code: string
  account_type: string
  payment_reference_prefix: string
  invoice_footer_note: string
}

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  id: 1,
  business_name: 'Cute & Creative Toppers',
  business_email: '',
  business_phone: '',
  bank_account_name: '',
  bank_name: '',
  account_number: '',
  branch_code: '',
  account_type: '',
  payment_reference_prefix: 'INV',
  invoice_footer_note: 'Payment reference: use your order or invoice number when making EFT payments.',
}