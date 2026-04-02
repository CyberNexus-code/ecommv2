'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { TagType } from '@/types/itemType'

type TagFilterProps = {
  tags: TagType[]
  selectedTags: string[]
}

export default function TagFilter({ tags, selectedTags }: TagFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleTagToggle = (tagSlug: string) => {
    const params = new URLSearchParams(searchParams)
    const currentTags = params.getAll('tags') || []

    if (currentTags.includes(tagSlug)) {
      // Remove tag
      const newTags = currentTags.filter(t => t !== tagSlug)
      params.delete('tags')
      newTags.forEach(t => params.append('tags', t))
    } else {
      // Add tag
      params.append('tags', tagSlug)
    }

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('tags')
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  if (tags.length === 0) return null

  return (
    <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-rose-900">Filter by Tag</h3>
        {selectedTags.length > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-medium text-rose-600 hover:text-rose-700"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.slug)
          return (
            <button
              key={tag.id}
              onClick={() => handleTagToggle(tag.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isSelected
                  ? 'bg-rose-700 text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:border-rose-400 hover:bg-rose-50'
              }`}
            >
              {tag.name}
              {isSelected && ' ✓'}
            </button>
          )
        })}
      </div>

      {selectedTags.length > 0 && (
        <div className="mt-3 text-xs text-gray-600">
          Filtering by: <span className="font-medium">{selectedTags.join(', ')}</span>
        </div>
      )}
    </div>
  )
}
