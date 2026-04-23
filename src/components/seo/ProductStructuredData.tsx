import { getProductPath } from '@/lib/items/routes'
import { siteUrl } from '@/lib/site'
import type { ItemType } from '@/types/itemType'

type ProductStructuredDataProps = {
  item: ItemType
}

export default function ProductStructuredData({ item }: ProductStructuredDataProps) {
  const categoryName = item.categories?.name ?? 'Collection'
  const images = item.item_images.map((image) => image.image_url)
  const productUrl = `${siteUrl}${getProductPath(item)}`

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Products',
          item: `${siteUrl}/products`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: item.name,
          item: productUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      productID: item.id,
      name: item.meta_title?.trim() || item.name,
      description: item.meta_description?.trim() || item.description || `${item.name} handmade product`,
      category: categoryName,
      image: images,
      url: productUrl,
      brand: {
        '@type': 'Brand',
        name: 'Cute & Creative Toppers',
      },
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'ZAR',
        price: Number(item.price).toFixed(2),
        availability: item.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    },
  ]

  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}