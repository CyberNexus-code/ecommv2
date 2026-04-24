import type { ItemType } from '@/types/itemType'

const CATEGORY_LIKE_TAG_SLUGS = new Set([
  '3d',
  'box',
  'boxes',
  'boxes-',
  'cake-topper',
  'cake-toppers',
  'cupcake',
  'cupcake-',
  'cupcakes',
  'cupcake-wrapper',
  'cupcake-wrappers',
  'full-part-set',
  'party-box',
  'party-boxes',
  'set-of-4',
  'set-of-6',
  'set-of-20',
  'topper',
  'toppers',
  'water-bottle-wrapper',
  'water-bottle-wrappers',
  'wrapper',
  'wrappers',
])

export function toTagSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function getCategorySlug(categoryName: string | null | undefined): string | null {
  if (!categoryName?.trim()) {
    return null
  }

  return toTagSlug(categoryName)
}

export function getCategorySlugsForItems(items: ItemType[]): Set<string> {
  const categorySlugs = new Set<string>()

  for (const item of items) {
    const categorySlug = getCategorySlug(item.categories?.name)

    if (categorySlug) {
      categorySlugs.add(categorySlug)
    }
  }

  return categorySlugs
}

export function isCategoryDuplicateTagSlug(tagSlug: string, categorySlugs: Set<string>): boolean {
  return categorySlugs.has(tagSlug)
}

export function isCategoryLikeTagSlug(tagSlug: string): boolean {
  return CATEGORY_LIKE_TAG_SLUGS.has(tagSlug)
}

export function isSemanticTagSlug(tagSlug: string, categorySlugs: Set<string>): boolean {
  return !isCategoryDuplicateTagSlug(tagSlug, categorySlugs) && !isCategoryLikeTagSlug(tagSlug)
}