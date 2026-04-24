import type { ItemType, TagType } from '@/types/itemType'
import { getCategorySlugsForItems, isCategoryDuplicateTagSlug } from '@/lib/items/tagMetadata'

export function getStorefrontTagsForItems(items: ItemType[]): TagType[] {
  const tagsBySlug = new Map<string, TagType>()
  const categorySlugs = getCategorySlugsForItems(items)

  for (const item of items) {
    for (const itemTag of item.items_tags ?? []) {
      const tag = itemTag.tags

      if (!tag?.id || !tag.name || !tag.slug) {
        continue
      }

      if (isCategoryDuplicateTagSlug(tag.slug, categorySlugs)) {
        continue
      }

      tagsBySlug.set(tag.slug, {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        created_at: '',
        updated_at: '',
      })
    }
  }

  return Array.from(tagsBySlug.values()).sort((left, right) => left.name.localeCompare(right.name))
}