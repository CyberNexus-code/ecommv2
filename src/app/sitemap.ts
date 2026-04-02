import type { MetadataRoute } from "next";
import { getAllItems } from "@/lib/items/get";
import { getProductPath } from "@/lib/items/routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/about", "/contact", "/products", "/basket", "/account"];
  const { items } = await getAllItems();
  const productRoutes = (items ?? []).map((item) => getProductPath(item));

  return [...routes, ...productRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : route.startsWith('/product/') ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith('/product/') ? 0.8 : 0.7,
  }));
}