import Image from 'next/image'
import Link from 'next/link'
import { getCustomerDisplay, isDeletedAccountEmail } from '@/lib/customers/display'
import { formatCurrency, formatInvoiceDate, getInvoiceReference, type InvoicePayload } from '@/lib/orders/invoice'

export default function InvoiceDocument({ invoice }: { invoice: InvoicePayload }) {
  const customerDisplay = getCustomerDisplay(invoice.customerName, invoice.customerEmail)
  const deletedAccount = isDeletedAccountEmail(invoice.customerEmail)
  const invoiceReference = getInvoiceReference(invoice)

  return (
    <article className="mx-auto w-full max-w-4xl rounded-[28px] border border-rose-200 bg-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] md:p-8 print:max-w-none print:rounded-none print:border-none print:p-0 print:shadow-none">
      <header className="flex flex-col gap-6 border-b border-rose-100 pb-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Image src="/logo.png" alt="Cute & Creative Toppers" width={280} height={110} className="h-20 w-auto object-contain" />
          <div className="text-sm text-stone-600">
            <p>{invoice.businessSettings.business_name}</p>
            {invoice.businessSettings.business_email ? <p>{invoice.businessSettings.business_email}</p> : null}
            {invoice.businessSettings.business_phone ? <p>{invoice.businessSettings.business_phone}</p> : null}
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Invoice</p>
          <h1 className="mt-1 text-3xl font-semibold text-rose-950">{invoiceReference}</h1>
          <p className="mt-2 text-sm text-stone-600">Issued {formatInvoiceDate(invoice.createdAt)}</p>
          <p className="mt-1 text-sm text-stone-600">Reference {invoiceReference}</p>
        </div>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Invoice To</p>
          <p className="mt-2 text-lg font-semibold text-rose-950">{customerDisplay.primary}</p>
          <p className="mt-1 text-sm text-stone-600">{customerDisplay.secondary}</p>
          <p className="mt-3 text-sm text-stone-600">
            {deletedAccount ? 'Delivery details redacted after account deletion' : invoice.deliveryAddress || 'Delivery address pending'}
          </p>
          <p className="text-sm text-stone-600">
            {deletedAccount ? '' : [invoice.deliveryCity, invoice.deliveryPostalCode].filter(Boolean).join(', ')}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Banking Details</p>
          <dl className="mt-2 space-y-2 text-sm text-stone-700">
            <div className="flex justify-between gap-4"><dt>Bank</dt><dd>{invoice.businessSettings.bank_name || 'Not set'}</dd></div>
            <div className="flex justify-between gap-4"><dt>Account Name</dt><dd>{invoice.businessSettings.bank_account_name || invoice.businessSettings.business_name}</dd></div>
            <div className="flex justify-between gap-4"><dt>Account Number</dt><dd>{invoice.businessSettings.account_number || 'Not set'}</dd></div>
            <div className="flex justify-between gap-4"><dt>Branch Code</dt><dd>{invoice.businessSettings.branch_code || 'Not set'}</dd></div>
            <div className="flex justify-between gap-4"><dt>Account Type</dt><dd>{invoice.businessSettings.account_type || 'Not set'}</dd></div>
            <div className="flex justify-between gap-4 font-semibold text-rose-800"><dt>Payment Reference</dt><dd>{invoiceReference}</dd></div>
          </dl>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-rose-100">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-rose-50 text-rose-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Item</th>
              <th className="px-4 py-3 text-right font-semibold">Qty</th>
              <th className="px-4 py-3 text-right font-semibold">Unit</th>
              <th className="px-4 py-3 text-right font-semibold">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={`${item.item_name ?? 'item'}-${index}`} className="border-t border-rose-100">
                <td className="px-4 py-3 text-stone-700">{item.item_name ?? 'Item'}</td>
                <td className="px-4 py-3 text-right text-stone-700">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-stone-700">{formatCurrency(item.unit_price)}</td>
                <td className="px-4 py-3 text-right font-medium text-stone-900">{formatCurrency(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2 text-sm text-stone-600">
          <p>Status: <span className="font-medium text-stone-800">{invoice.status.replaceAll('_', ' ')}</span></p>
          <p>{invoice.businessSettings.invoice_footer_note}</p>
        </div>
        <div className="rounded-2xl bg-rose-900 px-5 py-4 text-right text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-100">Amount Due</p>
          <p className="mt-1 text-3xl font-semibold">{formatCurrency(invoice.total)}</p>
        </div>
      </section>

      <footer className="mt-6 border-t border-rose-100 pt-4 text-sm text-stone-600">
        <p>
          <Link href="/terms-of-service" className="font-medium text-rose-700 hover:text-rose-800">Terms of Service</Link>
          {' '}|{' '}
          <Link href="/privacy-policy" className="font-medium text-rose-700 hover:text-rose-800">Privacy Policy</Link>
        </p>
      </footer>
    </article>
  )
}