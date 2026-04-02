'use server'

import { revalidatePath } from 'next/cache'
import { addTagToItem, removeTagFromItem } from '@/lib/items/tags'

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