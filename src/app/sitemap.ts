import type { MetadataRoute } from "next";
import { getStore } from "@/server/db/client";

/**
 * Public sitemap (Section 18).
 * Strictly excludes hidden admin routes, order token pages, and receipt pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const store = getStore();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/collections",
    "/custom-fit",
    "/about",
    "/press",
    "/contact",
    "/size-guide",
    "/order-lookup",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = store.products
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "daily",
      priority: 0.9,
    }));

  const collectionRoutes: MetadataRoute.Sitemap = store.collections
    .filter((c) => c.status === "published")
    .map((c) => ({
      url: `${base}/collections/${c.slug}`,
      lastModified: new Date(c.updatedAt),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
