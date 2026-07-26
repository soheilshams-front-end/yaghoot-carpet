import { prisma } from "@/lib/db";
import type { Rug } from "@/data/rugs";

export type ProductFilters = {
  shaneh?: number | null;
  /** category slug (legacy collection or free category) */
  collection?: string | null;
  q?: string | null;
  includeInactive?: boolean;
};

export type AdminProduct = Rug & {
  active: boolean;
  categoryIds: string[];
  gallery: string[];
};

function toRug(p: {
  id: string;
  title: string;
  code: string;
  price: number;
  shaneh: number;
  collection: string;
  image: string;
  stock: number;
  description: string;
  createdAt: Date;
  images?: { url: string; sortOrder: number }[];
}): Rug {
  const gallery =
    p.images && p.images.length
      ? [...p.images].sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.url)
      : [p.image];
  return {
    id: p.id,
    title: p.title,
    code: p.code,
    price: p.price,
    shaneh: p.shaneh as Rug["shaneh"],
    collection: p.collection,
    image: p.image || gallery[0] || "",
    stock: p.stock,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
    gallery,
  };
}

export async function listProducts(filters: ProductFilters = {}): Promise<Rug[]> {
  const { shaneh, collection, q, includeInactive } = filters;
  const query = (q ?? "").trim();
  const slug = collection?.trim() || null;

  const products = await prisma.product.findMany({
    where: {
      ...(includeInactive ? {} : { active: true }),
      ...(shaneh ? { shaneh } : {}),
      ...(slug
        ? {
            OR: [
              { collection: slug },
              { categories: { some: { category: { slug } } } },
            ],
          }
        : {}),
      ...(query ? searchWhere(query) : {}),
    },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map(toRug);
}

export async function searchProducts(q: string, limit = 6): Promise<Rug[]> {
  const query = q.trim();
  if (query.length < 1) return [];
  const products = await prisma.product.findMany({
    where: { active: true, ...searchWhere(query) },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(toRug);
}

function searchWhere(query: string) {
  const variants = searchVariants(query);
  return {
    OR: variants.flatMap((v) => [
      { title: { contains: v } },
      { code: { contains: v } },
      { description: { contains: v } },
      { collection: { contains: v } },
    ]),
  };
}

function searchVariants(q: string): string[] {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const ar = "٠١٢٣٤٥٦٧٨٩";
  const toFa = (s: string) =>
    s.replace(/[0-9]/g, (d) => fa[Number(d)]!).replace(/[٠-٩]/g, (d) => fa[ar.indexOf(d)]!);
  const toLat = (s: string) =>
    s
      .replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String(ar.indexOf(d)));
  const set = new Set([q, toFa(q), toLat(q)].map((s) => s.trim()).filter(Boolean));
  return [...set];
}

export async function countProducts(): Promise<number> {
  return prisma.product.count({ where: { active: true } });
}

export async function getProduct(id: string): Promise<Rug | null> {
  const p = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!p || !p.active) return null;
  return toRug(p);
}

export async function getProductAdmin(id: string): Promise<AdminProduct | null> {
  const p = await prisma.product.findUnique({
    where: { id },
    include: { images: true, categories: true },
  });
  if (!p) return null;
  const rug = toRug(p);
  return {
    ...rug,
    active: p.active,
    categoryIds: p.categories.map((c) => c.categoryId),
    gallery: rug.gallery ?? [rug.image],
  };
}

export async function listProductsAdmin(): Promise<AdminProduct[]> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      code: true,
      price: true,
      shaneh: true,
      collection: true,
      image: true,
      stock: true,
      description: true,
      active: true,
      createdAt: true,
      images: { select: { url: true, sortOrder: true } },
      categories: { select: { categoryId: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return products.map((p) => {
    const rug = toRug(p);
    return {
      ...rug,
      active: p.active,
      categoryIds: p.categories.map((c) => c.categoryId),
      gallery: rug.gallery ?? [rug.image],
    };
  });
}

export async function getRelatedProducts(id: string, limit = 4): Promise<Rug[]> {
  const current = await prisma.product.findUnique({
    where: { id },
    include: { categories: true },
  });
  if (!current) return [];
  const catIds = current.categories.map((c) => c.categoryId);
  const same = await prisma.product.findMany({
    where: {
      id: { not: id },
      active: true,
      ...(catIds.length
        ? { categories: { some: { categoryId: { in: catIds } } } }
        : { collection: current.collection }),
    },
    include: { images: true },
    take: limit,
  });
  if (same.length >= limit) return same.map(toRug);
  const rest = await prisma.product.findMany({
    where: {
      id: { not: id },
      active: true,
      ...(catIds.length
        ? { categories: { none: { categoryId: { in: catIds } } } }
        : { collection: { not: current.collection } }),
    },
    include: { images: true },
    take: limit - same.length,
  });
  return [...same, ...rest].map(toRug);
}
