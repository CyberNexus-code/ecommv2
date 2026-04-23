import type { ItemType } from "@/types/itemType";
import { getProductPath } from "@/lib/items/routes";
import { siteUrl } from '@/lib/site'

type ProductListStructuredDataProps = {
  items: ItemType[];
  title: string;
  description: string;
};

export default function ProductListStructuredData({ items, title, description }: ProductListStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    description,
    itemListElement: items.map((item, index) => {
      const primaryImage = item.item_images.find((image) => image.is_thumbnail) ?? item.item_images[0] ?? null;

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: item.meta_title?.trim() || item.name,
          description: item.meta_description?.trim() || item.description || `${item.name} handmade product`,
          category: item.categories?.name ?? undefined,
          image: primaryImage?.image_url,
          url: `${siteUrl}${getProductPath(item)}`,
          offers: {
            "@type": "Offer",
            priceCurrency: "ZAR",
            price: Number(item.price).toFixed(2),
            availability: item.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        },
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}