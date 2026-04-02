'use client'

import ButtonRose from '@/components/ui/button'

export default function InvoicePrintButton() {
  return (
    <ButtonRose type="button" variant="secondary1" onClick={() => window.print()}>
      Print Invoice
    </ButtonRose>
  )
}