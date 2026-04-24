'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { addToBasket } from '@/lib/baskets/basket'
import ProductCard from '@/components/ProductCard/ProductCard'
import { getCategoryPath } from '@/lib/items/categories'
import { getProductPath } from '@/lib/items/routes'
import type { ItemType } from '@/types/itemType'

type ProductDetailsClientProps = {
  item: ItemType
  relatedItems: ItemType[]
}

export default function ProductDetailsClient({ item, relatedItems }: ProductDetailsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const enlargeLabelId = useId()
  const enlargeNameId = useId()
  const description = item.description?.trim() || item.meta_description?.trim() || 'This handmade product is made to order.'
  const descriptionRef = useRef<HTMLDivElement | null>(null)
  const descriptionIndicatorRef = useRef<HTMLDivElement | null>(null)
  const descriptionDragStateRef = useRef<{ pointerId: number; trackHeight: number; thumbHeight: number } | null>(null)
  const relatedRailRef = useRef<HTMLDivElement | null>(null)
  const relatedRailIndicatorRef = useRef<HTMLDivElement | null>(null)
  const relatedRailDragStateRef = useRef<{ pointerId: number; trackWidth: number; thumbWidth: number } | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [showAllTags, setShowAllTags] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [descriptionCanExpand, setDescriptionCanExpand] = useState(false)
  const [descriptionScrollMetrics, setDescriptionScrollMetrics] = useState({
    hasOverflow: false,
    thumbHeightPercent: 100,
    thumbOffsetPercent: 0,
  })
  const [relatedRailMetrics, setRelatedRailMetrics] = useState({
    hasOverflow: false,
    thumbWidthPercent: 100,
    thumbOffsetPercent: 0,
  })
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
  const visibleTagNames = showAllTags ? tagNames : tagNames.slice(0, 4)

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
  const categoryPath = item.categories?.name ? getCategoryPath(item.categories.name) : '/products'
  const browseState = useMemo(() => {
    const rawBrowseHref = searchParams.get('browse')

    if (!rawBrowseHref) {
      return {
        href: categoryPath,
        pathname: categoryPath,
      }
    }

    try {
      const parsedBrowseUrl = new URL(rawBrowseHref, 'https://browse.local')

      if (parsedBrowseUrl.origin !== 'https://browse.local' || !parsedBrowseUrl.pathname.startsWith('/products')) {
        return {
          href: categoryPath,
          pathname: categoryPath,
        }
      }

      return {
        href: `${parsedBrowseUrl.pathname}${parsedBrowseUrl.search}${parsedBrowseUrl.hash}`,
        pathname: parsedBrowseUrl.pathname,
      }
    } catch {
      return {
        href: categoryPath,
        pathname: categoryPath,
      }
    }
  }, [categoryPath, searchParams])
  const browseHref = browseState.href
  const productsBreadcrumbHref = browseState.pathname === '/products' ? browseHref : '/products'
  const categoryBreadcrumbHref = browseState.pathname === categoryPath ? browseHref : categoryPath

  function handleBackNavigation() {
    router.push(browseHref)
  }

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

  useEffect(() => {
    const element = descriptionRef.current

    if (!element) {
      return
    }

    function syncDescriptionOverflow() {
      const currentElement = descriptionRef.current

      if (!currentElement) {
        return
      }

      setDescriptionCanExpand(currentElement.scrollHeight > currentElement.clientHeight + 1)

      if (!isDescriptionExpanded) {
        setDescriptionScrollMetrics({
          hasOverflow: false,
          thumbHeightPercent: 100,
          thumbOffsetPercent: 0,
        })
        return
      }

      const maxScrollTop = Math.max(currentElement.scrollHeight - currentElement.clientHeight, 0)
      const hasOverflow = maxScrollTop > 0
      const thumbHeightPercent = hasOverflow ? Math.max((currentElement.clientHeight / currentElement.scrollHeight) * 100, 22) : 100
      const availableTrackPercent = Math.max(100 - thumbHeightPercent, 0)
      const thumbOffsetPercent = hasOverflow && maxScrollTop > 0
        ? (currentElement.scrollTop / maxScrollTop) * availableTrackPercent
        : 0

      setDescriptionScrollMetrics({
        hasOverflow,
        thumbHeightPercent,
        thumbOffsetPercent,
      })
    }

    syncDescriptionOverflow()
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => syncDescriptionOverflow())

    resizeObserver?.observe(element)
    element.addEventListener('scroll', syncDescriptionOverflow, { passive: true })
    window.addEventListener('resize', syncDescriptionOverflow)

    return () => {
      resizeObserver?.disconnect()
      element.removeEventListener('scroll', syncDescriptionOverflow)
      window.removeEventListener('resize', syncDescriptionOverflow)
    }
  }, [description, isDescriptionExpanded])

  useEffect(() => {
    setIsDescriptionExpanded(false)
  }, [description])

  useEffect(() => {
    const rail = relatedRailRef.current

    if (!rail) {
      return
    }

    function syncRelatedRailMetrics() {
      const maxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0)
      const hasOverflow = maxScrollLeft > 0
      const thumbWidthPercent = hasOverflow ? Math.max((rail.clientWidth / rail.scrollWidth) * 100, 18) : 100
      const availableTrackPercent = Math.max(100 - thumbWidthPercent, 0)
      const thumbOffsetPercent = hasOverflow && maxScrollLeft > 0
        ? (rail.scrollLeft / maxScrollLeft) * availableTrackPercent
        : 0

      setRelatedRailMetrics({
        hasOverflow,
        thumbWidthPercent,
        thumbOffsetPercent,
      })
    }

    syncRelatedRailMetrics()
    rail.addEventListener('scroll', syncRelatedRailMetrics, { passive: true })
    window.addEventListener('resize', syncRelatedRailMetrics)

    return () => {
      rail.removeEventListener('scroll', syncRelatedRailMetrics)
      window.removeEventListener('resize', syncRelatedRailMetrics)
    }
  }, [relatedItems.length])

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const descriptionDragState = descriptionDragStateRef.current
      const descriptionElement = descriptionRef.current
      const descriptionIndicator = descriptionIndicatorRef.current

      if (descriptionDragState && descriptionElement && descriptionIndicator) {
        const rect = descriptionIndicator.getBoundingClientRect()
        const availableTrackHeight = Math.max(descriptionDragState.trackHeight - descriptionDragState.thumbHeight, 0)
        const nextOffset = Math.min(Math.max(event.clientY - rect.top - descriptionDragState.thumbHeight / 2, 0), availableTrackHeight)
        const maxScrollTop = Math.max(descriptionElement.scrollHeight - descriptionElement.clientHeight, 0)

        descriptionElement.scrollTop = availableTrackHeight > 0 ? (nextOffset / availableTrackHeight) * maxScrollTop : 0
      }

      const dragState = relatedRailDragStateRef.current
      const rail = relatedRailRef.current
      const indicator = relatedRailIndicatorRef.current

      if (!dragState || !rail || !indicator) {
        return
      }

      const rect = indicator.getBoundingClientRect()
      const availableTrackWidth = Math.max(dragState.trackWidth - dragState.thumbWidth, 0)
      const nextOffset = Math.min(Math.max(event.clientX - rect.left - dragState.thumbWidth / 2, 0), availableTrackWidth)
      const maxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0)

      rail.scrollLeft = availableTrackWidth > 0 ? (nextOffset / availableTrackWidth) * maxScrollLeft : 0
    }

    function handlePointerUp(event: PointerEvent) {
      if (descriptionDragStateRef.current && descriptionDragStateRef.current.pointerId === event.pointerId) {
        descriptionDragStateRef.current = null
      }

      if (!relatedRailDragStateRef.current || relatedRailDragStateRef.current.pointerId !== event.pointerId) {
        return
      }

      relatedRailDragStateRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [])

  function startRelatedRailDrag(event: React.PointerEvent<HTMLDivElement>) {
    const rail = relatedRailRef.current
    const indicator = relatedRailIndicatorRef.current

    if (!rail || !indicator || !relatedRailMetrics.hasOverflow) {
      return
    }

    const trackWidth = indicator.clientWidth
    const thumbWidth = (trackWidth * relatedRailMetrics.thumbWidthPercent) / 100

    relatedRailDragStateRef.current = {
      pointerId: event.pointerId,
      trackWidth,
      thumbWidth,
    }

    const rect = indicator.getBoundingClientRect()
    const availableTrackWidth = Math.max(trackWidth - thumbWidth, 0)
    const nextOffset = Math.min(Math.max(event.clientX - rect.left - thumbWidth / 2, 0), availableTrackWidth)
    const maxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0)

    rail.scrollLeft = availableTrackWidth > 0 ? (nextOffset / availableTrackWidth) * maxScrollLeft : 0
  }

  function startDescriptionDrag(event: React.PointerEvent<HTMLDivElement>) {
    const descriptionElement = descriptionRef.current
    const indicator = descriptionIndicatorRef.current

    if (!descriptionElement || !indicator || !descriptionScrollMetrics.hasOverflow) {
      return
    }

    const trackHeight = indicator.clientHeight
    const thumbHeight = (trackHeight * descriptionScrollMetrics.thumbHeightPercent) / 100

    descriptionDragStateRef.current = {
      pointerId: event.pointerId,
      trackHeight,
      thumbHeight,
    }

    const rect = indicator.getBoundingClientRect()
    const availableTrackHeight = Math.max(trackHeight - thumbHeight, 0)
    const nextOffset = Math.min(Math.max(event.clientY - rect.top - thumbHeight / 2, 0), availableTrackHeight)
    const maxScrollTop = Math.max(descriptionElement.scrollHeight - descriptionElement.clientHeight, 0)

    descriptionElement.scrollTop = availableTrackHeight > 0 ? (nextOffset / availableTrackHeight) * maxScrollTop : 0
  }

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
    <div className='relative mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden px-4 py-6 md:px-6 md:py-8'>
      <button
        type='button'
        onClick={handleBackNavigation}
        className='mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-800 transition hover:border-rose-300 hover:text-rose-950'
      >
        <span aria-hidden='true'>&larr;</span>
        Back to browsing
      </button>

      <div className='mb-6 flex flex-wrap items-center gap-2 text-sm text-rose-700/80'>
        <Link href={productsBreadcrumbHref} className='transition hover:text-rose-900'>Products</Link>
        <span>/</span>
        <Link href={categoryBreadcrumbHref} className='transition hover:text-rose-900'>{categoryName}</Link>
        <span>/</span>
        <span className='text-rose-950'>{item.name}</span>
      </div>

      <section className='w-full min-w-0 rounded-[2rem] border border-rose-100 bg-white p-3 shadow-[0_10px_30px_-22px_rgba(190,24,93,0.55)] sm:p-4 md:p-5'>
        <div className='grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start'>
          <div className='min-w-0 space-y-4 lg:flex lg:h-full lg:flex-col lg:justify-center lg:space-y-6 lg:py-4'>
            <button
              type='button'
              onClick={() => primaryImage && setLightboxOpen(true)}
              className='relative block aspect-square w-full overflow-hidden rounded-[1.5rem] bg-rose-50 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-4 sm:aspect-[4/3]'
              aria-labelledby={primaryImage ? `${enlargeLabelId} ${enlargeNameId}` : undefined}
            >
              {primaryImage ? (
                <>
                  <Image
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text?.trim() || item.meta_title?.trim() || item.name}
                    fill
                    sizes='(max-width: 1024px) 100vw, 55vw'
                    className='object-contain bg-white'
                    priority
                  />
                  <span id={enlargeLabelId} className='absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white sm:bottom-4 sm:right-4 sm:px-4 sm:py-2 sm:text-xs'>
                    {isCoarsePointer ? 'Tap to enlarge' : 'Click to enlarge'}
                  </span>
                  <span id={enlargeNameId} className='sr-only'>{item.name}</span>
                </>
              ) : (
                <div className='flex h-full items-center justify-center text-sm text-rose-400'>No image available</div>
              )}
            </button>

            {sortedImages.length > 1 ? (
              <div className='grid grid-flow-col auto-cols-[4.75rem] gap-3.5 overflow-x-auto pt-1 pb-1 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:pb-0'>
                {sortedImages.map((image, index) => {
                  const isActive = image.image_url === primaryImage?.image_url

                  return (
                    <button
                      key={image.id || `${image.image_url}-${index}`}
                      type='button'
                      onClick={() => selectImage(image.image_url)}
                      className={`relative aspect-square shrink-0 overflow-hidden rounded-2xl border transition ${isActive ? 'border-rose-500 ring-2 ring-rose-200' : 'border-rose-100 hover:border-rose-300'}`}
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
          </div>

          <div className='min-w-0 flex flex-col justify-between rounded-[1.7rem] bg-stone-50/65 p-4 sm:p-5 md:p-6'>
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
                <h1 className='text-2xl font-semibold tracking-tight text-rose-950 sm:text-3xl md:text-4xl'>{item.name}</h1>
                <p className='text-2xl font-bold text-rose-700 sm:text-3xl'>R{item.price.toFixed(2)}</p>
                <div className='max-w-2xl'>
                  <div className='relative pr-4'>
                    <div
                      ref={descriptionRef}
                      className={`text-sm leading-6 text-stone-700 transition-[max-height] duration-300 ease-out sm:text-base sm:leading-7 ${isDescriptionExpanded ? 'no-scrollbar max-h-48 overflow-y-auto pr-3 sm:max-h-52' : 'overflow-hidden max-h-28 sm:max-h-32'}`}
                    >
                      <p>{description}</p>
                    </div>
                    {!isDescriptionExpanded && descriptionCanExpand ? (
                      <div aria-hidden='true' className='pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#fffafa] via-[#fffafa]/92 to-transparent' />
                    ) : null}
                    {isDescriptionExpanded && descriptionScrollMetrics.hasOverflow ? (
                      <div
                        ref={descriptionIndicatorRef}
                        role='presentation'
                        onPointerDown={startDescriptionDrag}
                        className='absolute right-0 top-1 bottom-1 hidden w-2.5 cursor-grab justify-center rounded-full bg-rose-100/90 active:cursor-grabbing md:flex'
                      >
                        <div
                          className='w-full rounded-full bg-gradient-to-b from-rose-400 via-rose-500 to-rose-700 transition-[height,transform] duration-150 ease-out'
                          style={{
                            height: `${descriptionScrollMetrics.thumbHeightPercent}%`,
                            transform: `translateY(${descriptionScrollMetrics.thumbOffsetPercent}%)`,
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                  {descriptionCanExpand ? (
                    <button
                      type='button'
                      onClick={() => setIsDescriptionExpanded((current) => !current)}
                      className='mt-2 text-sm font-medium text-rose-700 underline-offset-4 transition hover:text-rose-900 hover:underline'
                    >
                      {isDescriptionExpanded ? 'Show less' : '...More'}
                    </button>
                  ) : null}
                </div>
              </div>

              {tagNames.length > 0 ? (
                <div className='space-y-3'>
                  <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${showAllTags ? 'max-h-64 opacity-100' : 'max-h-12 opacity-95'}`}>
                    <div className='flex flex-wrap gap-2'>
                    {visibleTagNames.map((tagName) => (
                      <span key={tagName} className='rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm text-rose-800'>
                        {tagName}
                      </span>
                    ))}
                    </div>
                  </div>
                  {tagNames.length > 4 ? (
                    <button
                      type='button'
                      onClick={() => setShowAllTags((current) => !current)}
                      className='text-sm font-medium text-rose-700 underline-offset-4 transition hover:text-rose-900 hover:underline'
                    >
                      {showAllTags ? 'Show fewer tags' : `Show all tags (${tagNames.length})`}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className='rounded-2xl border border-rose-100 bg-white p-4 text-sm text-stone-700'>
                <p className='font-semibold text-rose-900'>Product details</p>
                <p className='mt-2'>Each product is made to order. Use the gallery to review the available product images before adding it to your basket.</p>
              </div>
            </div>

            <div className='mt-8 flex flex-col gap-4 border-t border-rose-100 pt-5'>
              <div className='flex flex-wrap items-center gap-3'>
                <div className='inline-flex items-center rounded-full bg-amber-100 p-1'>
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

                <button
                  type='button'
                  onClick={handleAddToCart}
                  disabled={adding}
                  className='w-full rounded-2xl bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto'
                >
                  {adding ? 'Adding...' : 'Add to cart'}
                </button>
              </div>

              <Link href={getProductPath(item)} className='text-sm text-rose-700 underline-offset-4 transition hover:text-rose-900 hover:underline'>
                Share this product
              </Link>
            </div>
          </div>
        </div>
      </section>

      {relatedItems.length > 0 ? (
        <section className='mt-10 w-full min-w-0 overflow-x-hidden'>
          <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h2 className='text-2xl font-semibold text-rose-950'>Related products</h2>
              <p className='text-sm text-rose-700/80'>Similar handmade picks from the same collection and themes.</p>
            </div>
            <Link href={browseHref} className='text-sm font-medium text-rose-700 transition hover:text-rose-900'>Browse all</Link>
          </div>
          <div className='relative -mx-4 px-4'>
            <div ref={relatedRailRef} className='no-scrollbar overflow-x-auto pb-2 [touch-action:pan-x]'>
              <div className='flex w-max min-w-full gap-3 snap-x snap-mandatory pr-4 lg:gap-4'>
                {relatedItems.map((relatedItem) => (
                  <div key={relatedItem.id} className='w-44 shrink-0 snap-start md:w-48 lg:w-52'>
                    <ProductCard item={relatedItem} compact browseHref={browseHref} />
                  </div>
                ))}
              </div>
            </div>
            <div aria-hidden='true' className='pointer-events-none absolute inset-y-0 right-4 w-10 bg-gradient-to-l from-[#fffafa] via-[#fffafa]/90 to-transparent' />
            {relatedRailMetrics.hasOverflow ? (
              <div className='mt-3 hidden justify-center md:flex'>
                <div
                  ref={relatedRailIndicatorRef}
                  role='presentation'
                  onPointerDown={startRelatedRailDrag}
                  className='h-2 w-40 cursor-grab overflow-hidden rounded-full bg-rose-100/90 active:cursor-grabbing'
                >
                  <div
                    className='h-full rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-700 transition-[width,transform] duration-150 ease-out'
                    style={{
                      width: `${relatedRailMetrics.thumbWidthPercent}%`,
                      transform: `translateX(${relatedRailMetrics.thumbOffsetPercent}%)`,
                    }}
                  />
                </div>
              </div>
            ) : null}
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