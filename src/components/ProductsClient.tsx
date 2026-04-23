'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useState } from 'react';
import CatalogFiltersPanel from '@/components/CatalogFiltersPanel';
import ProductCard from '@/components/ProductCard/ProductCard';
import type { ItemType, TagType } from '@/types/itemType';

type ProductsClientProps = {
  initialItems: ItemType[]
  initialTags: TagType[]
}

export default function ProductsClient({ initialItems, initialTags }: ProductsClientProps) {
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
      <div className='relative mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-5'>
        <div className='relative shrink-0 pb-4'>
          <h1 className='text-2xl font-semibold text-rose-900 md:text-3xl'>Shop Our Collection</h1>
          <p className='text-sm text-rose-700/80 md:text-base'>Handmade cake toppers and party boxes, made to order.</p>
        </div>

        <CatalogFiltersPanel
          title='Refine products'
          searchId='product-search'
          searchLabel='Search products'
          placeholder='Search by name, theme or description'
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          tags={initialTags}
          selectedTags={selectedTags}
          mode='mobile'
        />

        <div className='grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start'>
          <div className='order-2 hidden lg:order-1 lg:block'>
            <CatalogFiltersPanel
              title='Refine products'
              searchId='product-search'
              searchLabel='Search products'
              placeholder='Search by name, theme or description'
              searchInput={searchInput}
              onSearchChange={setSearchInput}
              tags={initialTags}
              selectedTags={selectedTags}
              mode='desktop'
            />
          </div>

          <div className='order-1 min-w-0 lg:order-2'>
            {filteredItems.length === 0 ? (
              <div className='flex items-center justify-center rounded-2xl border border-rose-200 bg-white py-12 shadow-sm'>
                <p className='text-gray-600'>No products match your current search or filters.</p>
              </div>
            ) : (
              <>
                <div className='mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600'>
                  <span>
                    Showing {filteredItems.length} of {initialItems.length} products
                    {selectedTags.length > 0 && ` (${selectedTags.length} filter${selectedTags.length !== 1 ? 's' : ''} applied)`}
                  </span>
                  {selectedTags.length > 0 || searchTerm.length > 0 ? <span className='text-xs font-medium uppercase tracking-[0.16em] text-rose-500'>Filtered view</span> : null}
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
