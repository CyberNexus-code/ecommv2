import type { MetadataRoute } from "next";
import { getAllItems } from "@/lib/items/get";
import { getAllCategories } from '@/lib/items/get'
import { getCategoryPath } from '@/lib/items/categories'
import { getProductPath } from "@/lib/items/routes";
import { siteUrl } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { route: '', updatedAt: undefined, priority: 1, changeFrequency: 'weekly' as const },
    { route: '/about', updatedAt: undefined, priority: 0.7, changeFrequency: 'monthly' as const },
    { route: '/contact', updatedAt: undefined, priority: 0.7, changeFrequency: 'monthly' as const },
    { route: '/products', updatedAt: undefined, priority: 0.9, changeFrequency: 'weekly' as const },
    { route: '/privacy-policy', updatedAt: undefined, priority: 0.4, changeFrequency: 'yearly' as const },
    { route: '/terms-of-service', updatedAt: undefined, priority: 0.4, changeFrequency: 'yearly' as const },
  ]
  const { items } = await getAllItems();
  const { categories } = await getAllCategories()

  const categoryRoutes = (categories ?? []).map((category) => ({
    route: getCategoryPath(category.name),
    updatedAt: category.updated_at,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }))

  const productRoutes = (items ?? []).map((item) => ({
    route: getProductPath(item),
    updatedAt: item.updated_at,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes].map((entry) => ({
    url: `${siteUrl}${entry.route}`,
    lastModified: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}