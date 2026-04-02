'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard/ProductCard';
import TagFilter from '@/components/TagFilter';
import type { ItemType, TagType } from '@/types/itemType';

type ProductsCategoryClientProps = {
  categoryName: string
  initialItems: ItemType[]
  initialTags: TagType[]
}

export default function ProductsCategoryClient({ categoryName, initialItems, initialTags }: ProductsCategoryClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') ?? '';
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const deferredSearchInput = useDeferredValue(searchInput);
  const searchTerm = deferredSearchInput.trim().toLowerCase();

  useEffect(() => {
    if (searchInput === currentQuery) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchInput.trim()) {
        params.set('q', searchInput);
      } else {
        params.delete('q');
      }

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [currentQuery, pathname, router, searchInput, searchParams]);

  const selectedTags = searchParams.getAll('tags');
  const displayCategory = categoryName.replace('-', ' ');
  const filteredItems = initialItems.filter((item) => {
    const itemTagSlugs = (item.items_tags || [])
      .map((tag) => tag.tags?.slug)
      .filter((slug): slug is string => Boolean(slug));

    const matchesTags = selectedTags.length === 0 || selectedTags.some((selectedSlug) => itemTagSlugs.includes(selectedSlug));
    const haystack = [
      item.meta_title,
      item.meta_description,
      item.name,
      item.description,
      item.categories?.name,
      ...(item.items_tags || []).map((tag) => tag.tags?.name ?? ''),
    ].filter(Boolean).join(' ').toLowerCase();

    return matchesTags && (searchTerm.length === 0 || haystack.includes(searchTerm));
  });

  return (
    <>
      <div className='themed-scrollbar relative mx-auto h-[calc(100dvh-120px)] max-w-7xl overflow-y-auto px-4 py-8 pr-2 md:h-[calc(100dvh-140px)] md:px-6'>
        <div className='relative mb-6'>
          <h1 className='text-2xl font-semibold text-rose-900 md:text-3xl'>
            {displayCategory}
          </h1>
          <p className='text-sm text-rose-700/80 md:text-base'>Browse this category and add your favorites to basket.</p>
        </div>

        <div className='grid gap-6 lg:grid-cols-[280px_1fr]'>
          <aside className='h-fit rounded-2xl border border-rose-200 bg-white p-4 shadow-sm'>
            <div className='space-y-4'>
              <div>
                <label htmlFor='category-product-search' className='mb-1 block text-sm font-semibold text-rose-900'>Search this category</label>
                <input
                  id='category-product-search'
                  type='search'
                  value={searchInput}
                  placeholder='Search by name, theme or description'
                  onChange={(event) => setSearchInput(event.target.value)}
                  className='w-full rounded-xl border border-rose-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none'
                />
              </div>
              <TagFilter tags={initialTags} selectedTags={selectedTags} />
            </div>
          </aside>

          <div>
            {filteredItems.length === 0 ? (
              <div className='flex items-center justify-center rounded-2xl border border-rose-200 bg-white py-12 shadow-sm'>
                <p className='text-gray-600'>No products match your current search or filters.</p>
              </div>
            ) : (
              <>
                <div className='mb-4 text-sm text-gray-600'>
                  Showing {filteredItems.length} of {initialItems.length} products
                </div>
                <div className='relative grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
                  {filteredItems.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
