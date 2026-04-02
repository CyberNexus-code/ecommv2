import type { ItemType } from '@/types/itemType'

const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i

export function slugifyProductName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function getProductSlug(item: Pick<ItemType, 'id' | 'name'>) {
  return `${slugifyProductName(item.name)}-${item.id}`
}

export function getProductPath(item: Pick<ItemType, 'id' | 'name'>) {
  return `/product/${getProductSlug(item)}`
}

export function getProductIdFromSlug(productSlug: string) {
  const match = productSlug.match(uuidPattern)
  return match?.[1] ?? null
}