'use server'

import { revalidatePath } from 'next/cache'
import { addTagToItem, createTag, removeTagFromItem } from '@/lib/items/tags'

export async function attachTagToItem(itemId: string, tagId: string) {
  await addTagToItem(itemId, tagId)
  revalidatePath('/dashboard/products')
  revalidatePath('/products')
}

export async function detachTagFromItem(itemId: string, tagId: string) {
  await removeTagFromItem(itemId, tagId)
  revalidatePath('/dashboard/products')
  revalidatePath('/products')
}

export async function createAndAttachTagToItem(itemId: string, name: string, description?: string) {
  const tag = await createTag(name, description)
  await addTagToItem(itemId, tag.id)
  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard/tags')
  revalidatePath('/products')
  return tag
}