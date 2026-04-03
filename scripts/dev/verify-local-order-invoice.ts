import assert from 'node:assert/strict'
import { sendOrderPlacedEmails } from '../../src/lib/email/sendOrderEmail'
import type { BusinessSettings } from '../../src/types/businessSettings'

type AuthSessionResponse = {
  access_token: string
  refresh_token?: string
  user?: {
    id: string
    email?: string
  }
}

type BasketItemRow = {
  basket_id: string
}

type OrderRow = {
  id: string
  order_number: number
  status: string
  subtotal: number
  delivery_fee: number
  total: number
  created_at: string
  customer_name: string | null
  customer_email: string | null
  delivery_address: string | null
  delivery_city: string | null
  delivery_postal_code: string | number | null
  order_items: {
    item_name: string | null
    quantity: number
    unit_price: number
    line_total: number
  }[]
}

type MailpitMessage = {
  ID: string
  Subject?: string
  To?: Array<{ Address?: string }>
}

function required(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing env var ${name}`)
  }
  return value
}

const supabaseUrl = required('LOCAL_SUPABASE_URL')
const publishableKey = required('LOCAL_SUPABASE_PUBLISHABLE_KEY')
const serviceRoleKey = required('LOCAL_SUPABASE_SERVICE_ROLE_KEY')
const mailpitUrl = process.env.LOCAL_MAILPIT_URL ?? 'http://127.0.0.1:54324'

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} ${response.statusText}: ${await response.text()}`)
  }
  return response.json() as Promise<T>
}

async function restInsert<T>(table: string, body: unknown): Promise<T[]> {
  return requestJson<T[]>(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  })
}

async function restPatch(table: string, query: string, body: unknown) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Patch failed ${response.status}: ${await response.text()}`)
  }
}

async function restSelect<T>(path: string): Promise<T> {
  return requestJson<T>(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  })
}

async function authSignup(email: string, password: string) {
  return requestJson<AuthSessionResponse>(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
}

async function authSignIn(email: string, password: string) {
  return requestJson<AuthSessionResponse>(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
}

async function rpc<T>(name: string, token: string, body: unknown): Promise<T> {
  return requestJson<T>(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

async function getMailpitMessages() {
  return requestJson<{ messages: MailpitMessage[] }>(`${mailpitUrl}/api/v1/messages`)
}

async function getMailpitMessage(id: string) {
  return requestJson<unknown>(`${mailpitUrl}/api/v1/message/${id}`)
}

async function main() {
  const stamp = Date.now()
  const email = `invoice-test-${stamp}@example.com`
  const password = 'TestPass123!'

  const [settings] = await restInsert<BusinessSettings>('business_settings', {
    id: 1,
    business_name: 'Cute & Creative Toppers',
    business_email: 'accounts@cutecreative.test',
    business_phone: '0310000000',
    standard_delivery_rate: 50,
    bank_account_name: 'Cute Creative Toppers',
    bank_name: 'FNB',
    account_number: '12345678901',
    branch_code: '250655',
    account_type: 'Cheque',
    payment_reference_prefix: 'INV',
    invoice_footer_note: 'Use your invoice number as the EFT reference.',
  }).catch(async () => {
    await restPatch('business_settings', 'id=eq.1', {
      business_name: 'Cute & Creative Toppers',
      business_email: 'accounts@cutecreative.test',
      business_phone: '0310000000',
      standard_delivery_rate: 50,
      bank_account_name: 'Cute Creative Toppers',
      bank_name: 'FNB',
      account_number: '12345678901',
      branch_code: '250655',
      account_type: 'Cheque',
      payment_reference_prefix: 'INV',
      invoice_footer_note: 'Use your invoice number as the EFT reference.',
    })
    const rows = await restSelect<BusinessSettings[]>(`business_settings?id=eq.1&select=*`)
    return rows
  })

  const [category] = await restInsert<{ id: string }>('categories', {
    name: `test-category-${stamp}`,
    is_active: true,
    is_deleted: false,
  })

  const [item] = await restInsert<{ id: string }>('items', {
    category_id: category.id,
    name: `Invoice Test Item ${stamp}`,
    description: 'Local invoice verification item',
    price: 199.99,
    quantity: 20,
    is_active: true,
    is_deleted: false,
  })

  await restInsert('item_images', {
    item_id: item.id,
    image_url: '/logo.png',
    storage_path: 'local/logo.png',
    sort_order: 0,
    is_thumbnail: true,
  })

  await authSignup(email, password)
  const session = await authSignIn(email, password)
  const token = session.access_token
  const userId = session.user?.id

  assert.ok(token, 'Expected access token after sign in')
  assert.ok(userId, 'Expected user ID after sign in')

  await restPatch('profiles', `id=eq.${userId}`, {
    first_name: 'Invoice',
    last_name: 'Tester',
    delivery_address: '10 Test Street',
    city: 'Durban',
    postal_code: 4001,
    email,
  })

  await rpc('basket_add_item', token, { p_item_id: item.id, p_quantity: 1 })
  const basket = await rpc<BasketItemRow[]>('get_open_basket_items', token, {})
  const basketId = basket[0]?.basket_id
  assert.ok(basketId, 'Expected an open basket ID after adding an item')

  await rpc('place_order', token, { p_basket_id: basketId })

  const orders = await restSelect<OrderRow[]>(`orders?basket_id=eq.${basketId}&select=id,order_number,status,subtotal,delivery_fee,total,created_at,customer_name,customer_email,delivery_address,delivery_city,delivery_postal_code,order_items(item_name,quantity,unit_price,line_total)`) 
  const order = orders[0]
  assert.ok(order, 'Expected an order row after placing the order')

  await sendOrderPlacedEmails({
    orderId: order.id,
    orderNumber: Number(order.order_number),
    status: order.status,
    subtotal: Number(order.subtotal ?? 0),
    deliveryFee: Number(order.delivery_fee ?? 0),
    total: Number(order.total ?? 0),
    createdAt: order.created_at,
    customerEmail: order.customer_email ?? email,
    customerName: order.customer_name ?? 'Invoice Tester',
    deliveryAddress: order.delivery_address ?? '10 Test Street',
    deliveryCity: order.delivery_city ?? 'Durban',
    deliveryPostalCode: String(order.delivery_postal_code ?? '4001'),
    items: order.order_items.map((orderItem) => ({
      item_name: orderItem.item_name,
      quantity: Number(orderItem.quantity ?? 0),
      unit_price: Number(orderItem.unit_price ?? 0),
      line_total: Number(orderItem.line_total ?? 0),
    })),
    businessSettings: settings,
  })

  let messages: MailpitMessage[] = []
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const payload = await getMailpitMessages()
    messages = payload.messages.filter((message) => message.Subject?.includes(String(order.order_number)))
    if (messages.length >= 2) {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  assert.ok(messages.length >= 2, 'Expected both admin and customer emails in Mailpit')

  const invoiceMessage = messages.find((message) => message.Subject === `Invoice #${order.order_number}`)
  const adminMessage = messages.find((message) => message.Subject === `New Order Receipt #${order.order_number}`)

  assert.ok(invoiceMessage, 'Expected customer invoice email')
  assert.ok(adminMessage, 'Expected admin receipt email')

  const invoiceDetail = await getMailpitMessage(invoiceMessage!.ID)
  const serializedInvoice = JSON.stringify(invoiceDetail)

  assert.match(serializedInvoice, /FNB/)
  assert.match(serializedInvoice, /12345678901/)
  assert.match(serializedInvoice, /terms-of-service/)
  assert.match(serializedInvoice, /privacy-policy/)
  assert.match(serializedInvoice, /INV-/)

  console.log(`Verified local order #${order.order_number} and invoice email content for ${email}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})