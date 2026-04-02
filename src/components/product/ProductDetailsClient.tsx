'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { addToBasket } from '@/lib/baskets/basket'
import ProductCard from '@/components/ProductCard/ProductCard'
import { getProductPath } from '@/lib/items/routes'
import type { ItemType } from '@/types/itemType'

type ProductDetailsClientProps = {
  item: ItemType
  relatedItems: ItemType[]
}

export default function ProductDetailsClient({ item, relatedItems }: ProductDetailsClientProps) {
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const sortedImages = useMemo(
    () => [...item.item_images].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0)),
    [item.item_images],
  )
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const primaryImage = useMemo(() => {
    const thumbnail = sortedImages.find((image) => image.is_thumbnail)
    return sortedImages.find((image) => image.image_url === selectedImageUrl) ?? thumbnail ?? sortedImages[0] ?? null
  }, [selectedImageUrl, sortedImages])
  const currentImageIndex = Math.max(sortedImages.findIndex((image) => image.image_url === primaryImage?.image_url), 0)

  const tagNames = (item.items_tags ?? [])
    .map((tag) => tag.tags?.name)
    .filter((tagName): tagName is string => Boolean(tagName))

  async function handleAddToCart() {
    try {
      setAdding(true)
      await addToBasket(item.id, quantity)
      setQuantity(1)
    } finally {
      setAdding(false)
    }
  }

  function increaseQuantity() {
    setQuantity((current) => current + 1)
  }

  function decreaseQuantity() {
    setQuantity((current) => (current > 1 ? current - 1 : current))
  }

  const categoryName = item.categories?.name?.replace(/-/g, ' ') ?? 'Collection'

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)')

    function syncPointerType() {
      setIsCoarsePointer(mediaQuery.matches)
    }

    syncPointerType()
    mediaQuery.addEventListener('change', syncPointerType)

    return () => mediaQuery.removeEventListener('change', syncPointerType)
  }, [])

  useEffect(() => {
    if (!lightboxOpen) {
      return
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLightboxOpen(false)
      }

      if (event.key === 'ArrowRight') {
        if (sortedImages.length > 1) {
          const nextIndex = currentImageIndex === sortedImages.length - 1 ? 0 : currentImageIndex + 1
          setSelectedImageUrl(sortedImages[nextIndex].image_url)
        }
      }

      if (event.key === 'ArrowLeft') {
        if (sortedImages.length > 1) {
          const previousIndex = currentImageIndex === 0 ? sortedImages.length - 1 : currentImageIndex - 1
          setSelectedImageUrl(sortedImages[previousIndex].image_url)
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => window.removeEventListener('keydown', handleKeydown)
  }, [currentImageIndex, lightboxOpen, sortedImages])

  function selectImage(imageUrl: string) {
    setSelectedImageUrl(imageUrl)
  }

  function showPreviousImage() {
    if (sortedImages.length <= 1) {
      return
    }

    const previousIndex = currentImageIndex === 0 ? sortedImages.length - 1 : currentImageIndex - 1
    setSelectedImageUrl(sortedImages[previousIndex].image_url)
  }

  function showNextImage() {
    if (sortedImages.length <= 1) {
      return
    }

    const nextIndex = currentImageIndex === sortedImages.length - 1 ? 0 : currentImageIndex + 1
    setSelectedImageUrl(sortedImages[nextIndex].image_url)
  }

  return (
    <div className='themed-scrollbar relative mx-auto h-[calc(100dvh-120px)] max-w-7xl overflow-y-auto px-4 py-8 pr-2 md:h-[calc(100dvh-140px)] md:px-6'>
      <div className='mb-6 flex flex-wrap items-center gap-2 text-sm text-rose-700/80'>
        <Link href='/products' className='transition hover:text-rose-900'>Products</Link>
        <span>/</span>
        <span>{categoryName}</span>
      </div>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]'>
        <section className='space-y-4 rounded-[2rem] border border-rose-100 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(190,24,93,0.55)] md:p-5'>
          <button
            type='button'
            onClick={() => primaryImage && setLightboxOpen(true)}
            className='relative block aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-rose-50 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-4'
            aria-label={primaryImage ? `Open a larger view of ${item.name}` : undefined}
          >
            {primaryImage ? (
              <>
                <Image
                  src={primaryImage.image_url}
                  alt={primaryImage.alt_text?.trim() || item.meta_title?.trim() || item.name}
                  fill
                  sizes='(max-width: 1024px) 100vw, 55vw'
                  className='object-cover'
                  priority
                />
                <span className='absolute bottom-4 right-4 rounded-full bg-black/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white'>
                  {isCoarsePointer ? 'Tap to enlarge' : 'Click to enlarge'}
                </span>
              </>
            ) : (
              <div className='flex h-full items-center justify-center text-sm text-rose-400'>No image available</div>
            )}
          </button>

          {sortedImages.length > 1 ? (
            <div className='grid grid-cols-4 gap-3 sm:grid-cols-5'>
              {sortedImages.map((image, index) => {
                const isActive = image.image_url === primaryImage?.image_url

                return (
                  <button
                    key={image.id || `${image.image_url}-${index}`}
                    type='button'
                    onClick={() => selectImage(image.image_url)}
                    className={`relative aspect-square overflow-hidden rounded-2xl border transition ${isActive ? 'border-rose-500 ring-2 ring-rose-200' : 'border-rose-100 hover:border-rose-300'}`}
                    aria-label={`View image ${index + 1} for ${item.name}`}
                  >
                    <Image
                      src={image.image_url}
                      alt={image.alt_text?.trim() || `${item.name} image ${index + 1}`}
                      fill
                      sizes='120px'
                      className='object-cover'
                    />
                  </button>
                )
              })}
            </div>
          ) : null}
        </section>

        <section className='flex flex-col justify-between rounded-[2rem] border border-rose-100 bg-white p-6 shadow-[0_10px_30px_-22px_rgba(190,24,93,0.55)]'>
          <div className='space-y-5'>
            <div className='flex flex-wrap items-center gap-3'>
              <span className='rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700'>
                {categoryName}
              </span>
              <span className='rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900'>
                Handmade
              </span>
            </div>

            <div className='space-y-3'>
              <h1 className='text-3xl font-semibold tracking-tight text-rose-950 md:text-4xl'>{item.name}</h1>
              <p className='text-3xl font-bold text-rose-700'>R{item.price.toFixed(2)}</p>
              <p className='max-w-2xl text-base leading-7 text-stone-700'>
                {item.description?.trim() || item.meta_description?.trim() || 'This handmade product is made to order.'}
              </p>
            </div>

            {tagNames.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {tagNames.map((tagName) => (
                  <span key={tagName} className='rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm text-rose-800'>
                    {tagName}
                  </span>
                ))}
              </div>
            ) : null}

            <div className='rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-sm text-stone-700'>
              <p className='font-semibold text-rose-900'>Product details</p>
              <p className='mt-2'>Each topper is made to order. Use the gallery to review the available product images before adding it to your basket.</p>
            </div>
          </div>

          <div className='mt-8 flex flex-col gap-4 border-t border-rose-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center rounded-full bg-amber-100 p-1'>
              <button
                type='button'
                onClick={decreaseQuantity}
                aria-label={`Decrease quantity for ${item.name}`}
                className='h-10 w-10 rounded-full bg-amber-300 text-lg font-semibold text-amber-900 transition hover:bg-amber-400'
              >
                -
              </button>
              <p className='w-10 text-center text-base font-semibold text-amber-900'>{quantity}</p>
              <button
                type='button'
                onClick={increaseQuantity}
                aria-label={`Increase quantity for ${item.name}`}
                className='h-10 w-10 rounded-full bg-amber-300 text-lg font-semibold text-amber-900 transition hover:bg-amber-400'
              >
                +
              </button>
            </div>

            <div className='flex flex-col gap-3 sm:items-end'>
              <button
                type='button'
                onClick={handleAddToCart}
                disabled={adding}
                className='rounded-2xl bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70'
              >
                {adding ? 'Adding...' : 'Add to cart'}
              </button>
              <Link href={getProductPath(item)} className='text-sm text-rose-700 underline-offset-4 transition hover:text-rose-900 hover:underline'>
                Share this product
              </Link>
            </div>
          </div>
        </section>
      </div>

      {relatedItems.length > 0 ? (
        <section className='mt-10'>
          <div className='mb-5 flex items-end justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-semibold text-rose-950'>Related products</h2>
              <p className='text-sm text-rose-700/80'>Similar handmade picks from the same collection and themes.</p>
            </div>
            <Link href='/products' className='text-sm font-medium text-rose-700 transition hover:text-rose-900'>Browse all</Link>
          </div>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
            {relatedItems.map((relatedItem) => (
              <div key={relatedItem.id} className='min-w-0'>
                <ProductCard item={relatedItem} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {lightboxOpen && primaryImage ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4' role='dialog' aria-modal='true' aria-label={`${item.name} image viewer`}>
          <button
            type='button'
            onClick={() => setLightboxOpen(false)}
            className='absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20'
          >
            Close
          </button>

          {sortedImages.length > 1 ? (
            <>
              <button
                type='button'
                onClick={showPreviousImage}
                className='absolute left-4 rounded-full bg-white/10 px-4 py-3 text-white transition hover:bg-white/20'
                aria-label='Show previous image'
              >
                Prev
              </button>
              <button
                type='button'
                onClick={showNextImage}
                className='absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white transition hover:bg-white/20'
                aria-label='Show next image'
              >
                Next
              </button>
            </>
          ) : null}

          <div className='relative h-[75vh] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-black/20'>
            <Image
              src={primaryImage.image_url}
              alt={primaryImage.alt_text?.trim() || item.meta_title?.trim() || item.name}
              fill
              sizes='100vw'
              className='object-contain'
              priority
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}