import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetailsClient from '@/components/product/ProductDetailsClient'
import ProductStructuredData from '@/components/seo/ProductStructuredData'
import { getItemById, getRelatedItems } from '@/lib/items/get'
import { getProductIdFromSlug, getProductPath } from '@/lib/items/routes'
import type { ItemImage } from '@/types/itemType'

type ProductPageProps = {
  params: Promise<{ productSlug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productSlug } = await params
  const productId = getProductIdFromSlug(productSlug)

  if (!productId) {
    return {
      title: 'Product not found',
    }
  }

  const { item } = await getItemById(productId)

  if (!item) {
    return {
      title: 'Product not found',
    }
  }

  const description = item.meta_description?.trim() || item.description?.trim() || `View ${item.name} from Cute & Creative Toppers.`

  return {
    title: item.meta_title?.trim() || item.name,
    description,
    alternates: {
      canonical: getProductPath(item),
    },
    openGraph: {
      title: item.meta_title?.trim() || item.name,
      description,
      url: getProductPath(item),
      images: item.item_images.map((image: ItemImage) => ({
        url: image.image_url,
        alt: image.alt_text?.trim() || item.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: item.meta_title?.trim() || item.name,
      description,
      images: item.item_images[0]?.image_url ? [item.item_images[0].image_url] : undefined,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productSlug } = await params
  const productId = getProductIdFromSlug(productSlug)

  if (!productId) {
    notFound()
  }

  const { item, error } = await getItemById(productId)

  if (error || !item) {
    notFound()
  }

  const { items: relatedItems } = await getRelatedItems(item)

  return (
    <>
      <ProductStructuredData item={item} />
      <ProductDetailsClient item={item} relatedItems={relatedItems} />
    </>
  )
}