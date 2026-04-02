export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import InvoiceDocument from '@/components/dashboard/accounting/InvoiceDocument'
import InvoicePrintButton from '@/components/dashboard/accounting/InvoicePrintButton'
import { getBusinessSettings } from '@/lib/businessSettings'
import { getAccountingOrderById } from '@/lib/dashboard/accounting'
import { getInvoiceReferenceFromOrderNumber } from '@/lib/orders/reference'

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const [order, settings] = await Promise.all([
    getAccountingOrderById(orderId),
    getBusinessSettings(),
  ])

  if (!order) {
    notFound()
  }

  const invoiceReference = getInvoiceReferenceFromOrderNumber(order.orderNumber, settings.payment_reference_prefix)

  if (orderId !== invoiceReference) {
    redirect(`/dashboard/accounting/invoices/${invoiceReference}`)
  }

  return (
    <div className="space-y-4 print:space-y-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard/accounting" className="inline-flex rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
          Back to Accounting
        </Link>
        <InvoicePrintButton />
      </div>
      <InvoiceDocument invoice={{ ...order, businessSettings: settings }} />
    </div>
  )
}