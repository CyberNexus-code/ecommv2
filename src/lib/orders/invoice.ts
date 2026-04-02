import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { BusinessSettings } from '@/types/businessSettings'
import { getInvoiceReferenceFromOrderNumber } from '@/lib/orders/reference'

export type InvoiceItem = {
  item_name?: string | null
  quantity: number
  unit_price: number
  line_total: number
}

export type InvoicePayload = {
  orderId: string
  orderNumber: number
  status: string
  total: number
  createdAt: string
  customerEmail: string
  customerName: string
  deliveryAddress: string
  deliveryCity: string
  deliveryPostalCode: string
  items: InvoiceItem[]
  businessSettings: BusinessSettings
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function formatCurrency(value: number): string {
  return `R ${value.toFixed(2)}`
}

export function formatInvoiceDate(value: string): string {
  return new Date(value).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInvoiceReference(payload: InvoicePayload): string {
  return getInvoiceReferenceFromOrderNumber(payload.orderNumber, payload.businessSettings.payment_reference_prefix)
}

function buildItemsRows(payload: InvoicePayload) {
  return payload.items
    .map((item) => {
      const name = item.item_name ?? 'Item'
      return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #ffe4e6;">${escapeHtml(name)}</td>
        <td style="padding:10px 12px;text-align:right;border-bottom:1px solid #ffe4e6;">${item.quantity}</td>
        <td style="padding:10px 12px;text-align:right;border-bottom:1px solid #ffe4e6;">${formatCurrency(item.unit_price)}</td>
        <td style="padding:10px 12px;text-align:right;border-bottom:1px solid #ffe4e6;">${formatCurrency(item.line_total)}</td>
      </tr>`
    })
    .join('')
}

export function buildInvoiceHtml(payload: InvoicePayload): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const settings = payload.businessSettings
  const invoiceReference = getInvoiceReference(payload)

  return `
  <div style="background:#fff7f8;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
    <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #fecdd3;border-radius:18px;overflow:hidden;">
      <div style="padding:24px;background:linear-gradient(135deg,#fff1f2,#ffffff);border-bottom:1px solid #fecdd3;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <div>
            <img src="cid:invoice-logo" alt="Cute & Creative Toppers" style="height:82px;width:auto;display:block;" />
          </div>
          <div style="text-align:right;">
            <p style="margin:0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#e11d48;font-weight:700;">Invoice</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#881337;">${escapeHtml(invoiceReference)}</p>
            <p style="margin:4px 0 0;color:#57534e;">Issued ${escapeHtml(formatInvoiceDate(payload.createdAt))}</p>
          </div>
        </div>
      </div>
      <div style="padding:24px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
          <div style="padding:16px;border:1px solid #ffe4e6;border-radius:14px;background:#fffafb;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#e11d48;">Invoice To</p>
            <p style="margin:0;font-weight:700;color:#881337;">${escapeHtml(payload.customerName || payload.customerEmail)}</p>
            <p style="margin:6px 0 0;color:#57534e;">${escapeHtml(payload.customerEmail)}</p>
            <p style="margin:6px 0 0;color:#57534e;">${escapeHtml(payload.deliveryAddress || 'Delivery address pending')}</p>
            <p style="margin:4px 0 0;color:#57534e;">${escapeHtml([payload.deliveryCity, payload.deliveryPostalCode].filter(Boolean).join(', '))}</p>
          </div>
          <div style="padding:16px;border:1px solid #ffe4e6;border-radius:14px;background:#fffafb;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#e11d48;">Payment Details</p>
            <p style="margin:0;color:#57534e;"><strong>Bank:</strong> ${escapeHtml(settings.bank_name || 'Not set')}</p>
            <p style="margin:6px 0 0;color:#57534e;"><strong>Account Name:</strong> ${escapeHtml(settings.bank_account_name || settings.business_name)}</p>
            <p style="margin:6px 0 0;color:#57534e;"><strong>Account Number:</strong> ${escapeHtml(settings.account_number || 'Not set')}</p>
            <p style="margin:6px 0 0;color:#57534e;"><strong>Branch Code:</strong> ${escapeHtml(settings.branch_code || 'Not set')}</p>
            <p style="margin:6px 0 0;color:#57534e;"><strong>Account Type:</strong> ${escapeHtml(settings.account_type || 'Not set')}</p>
            <p style="margin:10px 0 0;font-weight:700;color:#881337;">Reference: ${escapeHtml(invoiceReference)}</p>
          </div>
        </div>

        <table style="width:100%;margin-top:20px;border-collapse:collapse;border:1px solid #ffe4e6;border-radius:14px;overflow:hidden;">
          <thead style="background:#fff1f2;color:#9f1239;">
            <tr>
              <th style="padding:10px 12px;text-align:left;">Item</th>
              <th style="padding:10px 12px;text-align:right;">Qty</th>
              <th style="padding:10px 12px;text-align:right;">Unit</th>
              <th style="padding:10px 12px;text-align:right;">Line Total</th>
            </tr>
          </thead>
          <tbody>${buildItemsRows(payload)}</tbody>
        </table>

        <div style="margin-top:18px;display:flex;justify-content:space-between;gap:16px;align-items:flex-end;flex-wrap:wrap;">
          <div>
            <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#e11d48;font-weight:700;">Order Status</p>
            <p style="margin:6px 0 0;color:#57534e;">${escapeHtml(payload.status.replaceAll('_', ' '))}</p>
            <p style="margin:8px 0 0;color:#57534e;">${escapeHtml(settings.invoice_footer_note || '')}</p>
          </div>
          <div style="min-width:220px;padding:16px;border-radius:16px;background:#881337;color:#ffffff;text-align:right;">
            <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#fecdd3;">Amount Due</p>
            <p style="margin:6px 0 0;font-size:28px;font-weight:800;">${formatCurrency(payload.total)}</p>
          </div>
        </div>
      </div>
      <div style="padding:18px 24px;border-top:1px solid #fecdd3;background:#fff7f8;color:#57534e;font-size:13px;">
        <p style="margin:0;">${escapeHtml(settings.business_name)}${settings.business_email ? ` | ${escapeHtml(settings.business_email)}` : ''}${settings.business_phone ? ` | ${escapeHtml(settings.business_phone)}` : ''}</p>
        <p style="margin:8px 0 0;">
          Terms: <a href="${siteUrl}/terms-of-service" style="color:#be123c;">${siteUrl}/terms-of-service</a>
          &nbsp;|&nbsp;
          Privacy: <a href="${siteUrl}/privacy-policy" style="color:#be123c;">${siteUrl}/privacy-policy</a>
        </p>
      </div>
    </div>
  </div>`
}

export function buildInvoiceText(payload: InvoicePayload): string {
  const settings = payload.businessSettings
  const invoiceReference = getInvoiceReference(payload)
  const lines = [
    `${settings.business_name} Invoice`,
    `Invoice: ${invoiceReference}`,
    `Payment reference: ${invoiceReference}`,
    `Issued: ${formatInvoiceDate(payload.createdAt)}`,
    `Customer: ${payload.customerName || payload.customerEmail}`,
    `Email: ${payload.customerEmail}`,
    `Delivery: ${[payload.deliveryAddress, payload.deliveryCity, payload.deliveryPostalCode].filter(Boolean).join(', ')}`,
    '',
    'Items:',
    ...payload.items.map((item) => `${item.item_name ?? 'Item'} | Qty ${item.quantity} | Unit ${formatCurrency(item.unit_price)} | Line ${formatCurrency(item.line_total)}`),
    '',
    `Amount due: ${formatCurrency(payload.total)}`,
    `Bank: ${settings.bank_name || 'Not set'}`,
    `Account name: ${settings.bank_account_name || settings.business_name}`,
    `Account number: ${settings.account_number || 'Not set'}`,
    `Branch code: ${settings.branch_code || 'Not set'}`,
    `Account type: ${settings.account_type || 'Not set'}`,
    `Terms: ${(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')}/terms-of-service`,
    `Privacy: ${(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')}/privacy-policy`,
  ]

  return lines.join('\n')
}

export function buildAdminReceiptHtml(payload: InvoicePayload): string {
  const invoiceReference = getInvoiceReference(payload)

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#fff7f8;padding:20px;">
    <div style="max-width:700px;margin:0 auto;background:#fff;border:1px solid #fecdd3;border-radius:12px;overflow:hidden;">
      <div style="padding:14px 16px;background:linear-gradient(90deg,#be123c,#e11d48);color:#fff;">
        <h2 style="margin:0;font-size:18px;">New Order Receipt</h2>
      </div>
      <div style="padding:16px;color:#1c1917;">
        <p style="margin:0 0 12px;">A new order has been placed and a customer invoice has been sent.</p>
        <p style="margin:0 0 8px;"><strong>Invoice:</strong> ${escapeHtml(invoiceReference)}</p>
        <p style="margin:0 0 8px;"><strong>Customer:</strong> ${escapeHtml(payload.customerName || payload.customerEmail)}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(payload.customerEmail)}</p>
        <p style="margin:0 0 8px;"><strong>Delivery:</strong> ${escapeHtml([payload.deliveryAddress, payload.deliveryCity, payload.deliveryPostalCode].filter(Boolean).join(', '))}</p>
        <p style="margin:0 0 16px;"><strong>Total:</strong> ${formatCurrency(payload.total)}</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #ffe4e6;border-radius:8px;overflow:hidden;">
          <thead style="background:#fff1f2;color:#9f1239;">
            <tr>
              <th style="padding:8px;text-align:left;">Item</th>
              <th style="padding:8px;text-align:right;">Qty</th>
              <th style="padding:8px;text-align:right;">Unit</th>
              <th style="padding:8px;text-align:right;">Line Total</th>
            </tr>
          </thead>
          <tbody>${buildItemsRows(payload)}</tbody>
        </table>
      </div>
    </div>
  </div>`
}

export function buildAdminReceiptText(payload: InvoicePayload): string {
  const invoiceReference = getInvoiceReference(payload)

  return [
    `New order receipt ${invoiceReference}`,
    `Customer: ${payload.customerName || payload.customerEmail}`,
    `Email: ${payload.customerEmail}`,
    `Delivery: ${[payload.deliveryAddress, payload.deliveryCity, payload.deliveryPostalCode].filter(Boolean).join(', ')}`,
    `Total: ${formatCurrency(payload.total)}`,
    '',
    ...payload.items.map((item) => `${item.item_name ?? 'Item'} | Qty ${item.quantity} | Line ${formatCurrency(item.line_total)}`),
  ].join('\n')
}

export async function getInvoiceLogoAttachment() {
  const content = await readFile(path.join(process.cwd(), 'public', 'logo.png'))

  return {
    filename: 'logo.png',
    content,
    cid: 'invoice-logo',
  }
}