'use client'

import { useEffect, useState, useTransition } from 'react'
import type { ItemType, TagType } from '@/types/itemType'
import { attachTagToItem, createAndAttachTagToItem, detachTagFromItem } from '@/app/_actions/tagActions'

type TagManagerProps = {
  item: ItemType
  allTags: TagType[]
  onUpdate?: () => void
}

export default function TagManager({ item, allTags, onUpdate }: TagManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignedTagIds, setAssignedTagIds] = useState<string[]>([])
  const [localTags, setLocalTags] = useState<TagType[]>(allTags)
  const [searchQuery, setSearchQuery] = useState('')
  const [newTagDescription, setNewTagDescription] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setAssignedTagIds((item.items_tags || []).map(it => it.tags?.id).filter(Boolean) as string[])
  }, [item.items_tags])

  useEffect(() => {
    setLocalTags(allTags)
  }, [allTags])

  const currentTagIds = new Set(assignedTagIds)
  const availableTags = localTags.filter(tag => !currentTagIds.has(tag.id))
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredTags = normalizedSearch.length === 0
    ? availableTags
    : availableTags.filter((tag) => {
        const haystack = `${tag.name} ${tag.description ?? ''}`.toLowerCase()
        return haystack.includes(normalizedSearch)
      })
  const hasSearchValue = searchQuery.trim().length > 0
  const shouldCreateFromSearch = hasSearchValue && filteredTags.length === 0

  const handleAddTag = async (tagId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await attachTagToItem(item.id, tagId)
      setAssignedTagIds((current) => current.includes(tagId) ? current : [...current, tagId])
      setSearchQuery('')
      setNewTagDescription('')
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

  const handleCreateTag = async () => {
    const normalizedName = searchQuery.trim()

    if (!normalizedName) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const createdTag = await createAndAttachTagToItem(item.id, normalizedName, newTagDescription.trim() || undefined)

      setLocalTags((current) => {
        if (current.some((tag) => tag.id === createdTag.id)) {
          return current
        }

        return [...current, createdTag].sort((left, right) => left.name.localeCompare(right.name))
      })
      setAssignedTagIds((current) => current.includes(createdTag.id) ? current : [...current, createdTag.id])
      setSearchQuery('')
      setNewTagDescription('')
      startTransition(() => onUpdate?.())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePickerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (filteredTags.length > 0) {
      await handleAddTag(filteredTags[0].id)
      return
    }

    if (shouldCreateFromSearch && newTagDescription.trim()) {
      await handleCreateTag()
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-rose-900">Tags</h3>
        <p className="text-xs text-stone-500">Type to search existing tags to associate, or create a new one inline if no match exists.</p>
      </div>

      <form onSubmit={handlePickerSubmit} className="space-y-3">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 focus-within:border-rose-400">
            {allTags
              .filter(tag => currentTagIds.has(tag.id))
              .map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    disabled={isLoading || isPending}
                    className="text-rose-700 hover:text-rose-900 disabled:opacity-50"
                    aria-label={`Remove ${tag.name} tag`}
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setError(null)
                }}
                disabled={isLoading || isPending}
                placeholder={assignedTagIds.length > 0 ? 'Search or create tags' : 'Add tags'}
                className="min-w-[12rem] flex-1 bg-transparent py-1 text-sm text-rose-900 outline-none placeholder:text-stone-400"
              />
            </div>

          {searchQuery.trim() ? (
            <div className="mt-3 space-y-3">
            {filteredTags.length > 0 ? (
              <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleAddTag(tag.id)}
                    disabled={isLoading || isPending}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-rose-100 bg-white px-3 py-2 text-left transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-rose-900">{tag.name}</span>
                      {tag.description ? <span className="block truncate text-xs text-stone-500">{tag.description}</span> : null}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-rose-700">Add</span>
                  </button>
                ))}
              </div>
            ) : null}

            {shouldCreateFromSearch ? (
              <div className="space-y-2 border-t border-rose-100 pt-3">
                <p className="text-sm text-stone-600">
                  No matching unassigned tags found. press enter to create and associate tag.
                </p>
                <input
                  type="text"
                  value={newTagDescription}
                  onChange={(event) => setNewTagDescription(event.target.value)}
                  disabled={isLoading || isPending}
                  placeholder="Tag description"
                  className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-900 focus:border-rose-400 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newTagDescription.trim() || isLoading || isPending}
                    className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading || isPending ? 'Creating...' : 'Create and add tag'}
                  </button>
                </div>
              </div>
            ) : null}
            </div>
          ) : null}
        </div>
      </form>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
