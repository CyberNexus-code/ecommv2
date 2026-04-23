'use client'

import { AdjustmentsHorizontalIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import TagFilter from '@/components/TagFilter'
import type { TagType } from '@/types/itemType'

type CatalogFiltersPanelProps = {
  title: string
  searchId: string
  searchLabel: string
  placeholder: string
  searchInput: string
  onSearchChange: (value: string) => void
  tags: TagType[]
  selectedTags: string[]
  mode?: 'mobile' | 'desktop'
}

export default function CatalogFiltersPanel({
  title,
  searchId,
  searchLabel,
  placeholder,
  searchInput,
  onSearchChange,
  tags,
  selectedTags,
  mode = 'mobile',
}: CatalogFiltersPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopTagsOpen, setDesktopTagsOpen] = useState(selectedTags.length > 0)
  const activeFilterCount = selectedTags.length + (searchInput.trim() ? 1 : 0)

  useEffect(() => {
    if (selectedTags.length > 0) {
      setDesktopTagsOpen(true)
    }
  }, [selectedTags.length])

  if (mode === 'desktop') {
    return (
      <aside className='hidden h-fit rounded-[1.75rem] border border-rose-200 bg-white/95 p-4 shadow-[0_18px_40px_-28px_rgba(190,24,93,0.45)] lg:block'>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-rose-500'>{title}</p>
        <div className='mt-4 space-y-4'>
          <div>
            <label htmlFor={`${searchId}-desktop`} className='mb-1.5 block text-sm font-semibold text-rose-900'>{searchLabel}</label>
            <div className='relative'>
              <MagnifyingGlassIcon className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-rose-400' />
              <input
                id={`${searchId}-desktop`}
                type='search'
                value={searchInput}
                placeholder={placeholder}
                onChange={(event) => onSearchChange(event.target.value)}
                className='w-full rounded-xl border border-rose-200 bg-rose-50/30 py-2.5 pl-10 pr-3 text-sm text-rose-950 focus:border-rose-400 focus:outline-none'
              />
            </div>
          </div>

          <div className='rounded-2xl border border-rose-100 bg-rose-50/45 p-3'>
            <button
              type='button'
              onClick={() => setDesktopTagsOpen((current) => !current)}
              className='flex w-full items-center justify-between gap-3 text-left'
              aria-expanded={desktopTagsOpen}
              aria-controls={`${searchId}-desktop-tag-filters`}
            >
              <span className='text-sm font-semibold text-rose-900'>Tag filters</span>
              <span className='inline-flex items-center gap-2 text-xs font-medium text-rose-700'>
                {selectedTags.length > 0 ? `${selectedTags.length} active` : desktopTagsOpen ? 'Hide' : 'Show'}
                <ChevronDownIcon className={`size-4 transition-transform ${desktopTagsOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {desktopTagsOpen ? (
              <div id={`${searchId}-desktop-tag-filters`} className='mt-3'>
                <TagFilter tags={tags} selectedTags={selectedTags} compact />
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    )
  }

  return (
    <div className='mb-5 space-y-3 lg:hidden'>
      <div className='flex items-center gap-2'>
        <label htmlFor={searchId} className='sr-only'>{searchLabel}</label>
        <div className='relative flex-1'>
          <MagnifyingGlassIcon className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-rose-400' />
          <input
            id={searchId}
            type='search'
            value={searchInput}
            placeholder={placeholder}
            onChange={(event) => onSearchChange(event.target.value)}
            className='w-full rounded-2xl border border-rose-200 bg-white/95 py-3 pl-10 pr-4 text-sm text-rose-950 shadow-[0_10px_25px_-20px_rgba(190,24,93,0.45)] focus:border-rose-400 focus:outline-none'
          />
        </div>
        <button
          type='button'
          onClick={() => setMobileOpen((current) => !current)}
          className='inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-3 py-3 text-sm font-medium text-rose-800 shadow-[0_10px_25px_-20px_rgba(190,24,93,0.45)]'
          aria-expanded={mobileOpen}
          aria-controls={`${searchId}-filters`}
        >
          <AdjustmentsHorizontalIcon className='size-4' />
          {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
        </button>
      </div>

      {mobileOpen ? (
        <div id={`${searchId}-filters`} className='rounded-[1.75rem] border border-rose-200 bg-white/95 p-3 shadow-[0_18px_40px_-28px_rgba(190,24,93,0.45)]'>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500'>{title}</p>
          <TagFilter tags={tags} selectedTags={selectedTags} compact />
        </div>
      ) : null}
    </div>
  )
}