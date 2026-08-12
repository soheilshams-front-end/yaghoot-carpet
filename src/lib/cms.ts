import { prisma } from "@/lib/db";

export type CmsCategory = {
  id: string;
  slug: string;
  title: string;
  image: string;
  sortOrder: number;
  active: boolean;
  showInHome: boolean;
  showInShop: boolean;
};

export type HomepageSectionRow = {
  id: string;
  key: string;
  title: string;
  enabled: boolean;
  sortOrder: number;
  payload: Record<string, unknown>;
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function listCategories(opts?: {
  shopOnly?: boolean;
  homeOnly?: boolean;
  activeOnly?: boolean;
}): Promise<CmsCategory[]> {
  const rows = await prisma.category.findMany({
    where: {
      ...(opts?.activeOnly ? { active: true } : {}),
      ...(opts?.shopOnly ? { showInShop: true } : {}),
      ...(opts?.homeOnly ? { showInHome: true } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });
  return rows;
}

export async function getHomepageSections(enabledOnly = true): Promise<HomepageSectionRow[]> {
  const rows = await prisma.homepageSection.findMany({
    where: enabledOnly ? { enabled: true } : undefined,
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    ...r,
    payload: parseJson<Record<string, unknown>>(r.payload, {}),
  }));
}

export async function getSiteSetting<T = unknown>(key: string, fallback: T): Promise<T> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  if (!row) return fallback;
  return parseJson<T>(row.value, fallback);
}

export type CmsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  coverImage: string;
  published: boolean;
  publishedAt: Date | null;
  metaTitle: string;
  metaDesc: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function listArticles(opts?: {
  publishedOnly?: boolean;
}): Promise<CmsArticle[]> {
  return prisma.article.findMany({
    where: opts?.publishedOnly ? { published: true } : undefined,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function listArticlesAdmin(): Promise<CmsArticle[]> {
  return prisma.article.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getArticleBySlug(
  slug: string,
  opts?: { publishedOnly?: boolean },
): Promise<CmsArticle | null> {
  const row = await prisma.article.findUnique({ where: { slug } });
  if (!row) return null;
  if (opts?.publishedOnly && !row.published) return null;
  return row;
}

export async function getArticleById(id: string): Promise<CmsArticle | null> {
  return prisma.article.findUnique({ where: { id } });
}

export async function getAdminDashboard() {
  const [productCount, orderCount, paidAgg, pendingOrders] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PREPARING", "SHIPPING", "DELIVERED"] } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
  ]);

  return {
    productCount,
    orderCount,
    paidRevenue: paidAgg._sum.total ?? 0,
    paidCount: paidAgg._count,
    pendingOrders,
  };
}
