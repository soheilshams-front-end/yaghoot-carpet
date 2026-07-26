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

export async function getAdminDashboard() {
  const [productCount, orderCount, lowStock, paidAgg, pendingOrders] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.product.findMany({
      where: { active: true, stock: { lte: 3 } },
      orderBy: { stock: "asc" },
      take: 8,
      select: { id: true, title: true, stock: true, code: true },
    }),
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
    lowStock,
    paidRevenue: paidAgg._sum.total ?? 0,
    paidCount: paidAgg._count,
    pendingOrders,
  };
}
