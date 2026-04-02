export function getInvoiceReferenceFromOrderNumber(orderNumber: number, prefix?: string | null): string {
  const normalizedPrefix = prefix?.trim() || 'INV'
  return `${normalizedPrefix}-${orderNumber}`
}

export function parseInvoiceLookup(input: string): { orderNumber: number | null; isUuid: boolean } {
  const normalized = input.trim()
  const orderNumberMatch = normalized.match(/(\d+)$/)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)

  return {
    orderNumber: orderNumberMatch ? Number(orderNumberMatch[1]) : null,
    isUuid,
  }
}