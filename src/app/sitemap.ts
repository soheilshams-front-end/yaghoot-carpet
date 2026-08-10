import type { MetadataRoute } from "next";
import { listArticles, listCategories } from "@/lib/cms";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const [products, categories, articles] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: { id: true, updatedAt: true },
    }),
    listCategories({ activeOnly: true }),
    listArticles({ publishedOnly: true }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/rugs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/articles`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/rugs/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/rugs?collection=${encodeURIComponent(c.slug)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries, ...categoryEntries, ...articleEntries];
}
