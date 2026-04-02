'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import type { ItemType, TagType } from '@/types/itemType'
import { attachTagToItem, detachTagFromItem } from '@/app/_actions/tagActions'

type TagManagerProps = {
  item: ItemType
  allTags: TagType[]
  onUpdate?: () => void
}

export default function TagManager({ item, allTags, onUpdate }: TagManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignedTagIds, setAssignedTagIds] = useState<string[]>([])
  const [selectedTagId, setSelectedTagId] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setAssignedTagIds((item.items_tags || []).map(it => it.tags?.id).filter(Boolean) as string[])
  }, [item.items_tags])

  const currentTagIds = new Set(assignedTagIds)
  const availableTags = allTags.filter(tag => !currentTagIds.has(tag.id))

  useEffect(() => {
    if (!availableTags.some((tag) => tag.id === selectedTagId)) {
      setSelectedTagId(availableTags[0]?.id ?? '')
    }
  }, [availableTags, selectedTagId])

  const handleAddTag = async (tagId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await attachTagToItem(item.id, tagId)
      setAssignedTagIds((current) => current.includes(tagId) ? current : [...current, tagId])
      setSelectedTagId('')
      startTransition(() => onUpdate?.())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tag')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveTag = async (tagId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await detachTagFromItem(item.id, tagId)
      setAssignedTagIds((current) => current.filter((id) => id !== tagId))
      startTransition(() => onUpdate?.())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove tag')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-rose-900">Tags</h3>
          <p className="text-xs text-stone-500">Assign theme and filter tags to this product.</p>
        </div>
        <Link href="/dashboard/tags" className="text-xs font-medium text-rose-700 hover:text-rose-800">
          Manage tags
        </Link>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {Array.from(currentTagIds).length > 0 ? (
          allTags
            .filter(tag => currentTagIds.has(tag.id))
            .map(tag => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700"
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  disabled={isLoading || isPending}
                  className="text-rose-700 hover:text-rose-900 disabled:opacity-50"
                  aria-label={`Remove ${tag.name} tag`}
                >
                  ×
                </button>
              </div>
            ))
        ) : (
          <p className="text-xs text-gray-500">No tags yet</p>
        )}
      </div>

      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3">
        <label className="mb-2 block text-xs font-medium text-gray-600">Add tag to this product</label>
        {availableTags.length > 0 ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedTagId}
              onChange={(event) => setSelectedTagId(event.target.value)}
              disabled={isLoading || isPending}
              className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-900 focus:border-rose-400 focus:outline-none"
            >
              {availableTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => selectedTagId && handleAddTag(selectedTagId)}
              disabled={!selectedTagId || isLoading || isPending}
              className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading || isPending ? 'Adding...' : 'Add tag'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-stone-600">
            No unassigned tags available. Create more on the tags page if you need additional filters.
          </p>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
