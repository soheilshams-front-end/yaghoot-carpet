"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteStoredFile, isLocalUploadUrl } from "@/lib/storage";
import { ORDER_TRANSITIONS } from "@/lib/admin/order-status";
import { markOrderPaid } from "@/lib/order-payment";
import {
  articleInputSchema,
  categoryInputSchema,
  homepagePayloadSchema,
  parseProductInput,
} from "@/lib/validation";
import { sanitizeImageUrl } from "@/lib/safe-image-url";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { slugify, uniqueSlug } from "@/lib/slug";
import { CATALOG_STOCK } from "@/lib/filters";
import { serializeAvailableSizes, ALL_SIZE_IDS } from "@/lib/sizes";
import type { OrderStatus } from "@/generated/prisma/client";

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/rugs");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
}

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  revalidatePath("/admin/settings");
}

/* ─── Categories ─── */

export async function saveCategoryAction(input: {
  id?: string;
  slug?: string;
  title: string;
  image: string;
  sortOrder: number;
  active: boolean;
  showInHome: boolean;
  showInShop: boolean;
}) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };

  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "اطلاعات دسته نامعتبر است" };
  }

  const title = parsed.data.title.trim();
  const image = sanitizeImageUrl(parsed.data.image) ?? "";
  const slug = (parsed.data.slug?.trim() || slugify(title)).toLowerCase();

  try {
    if (parsed.data.id) {
      await prisma.category.update({
        where: { id: parsed.data.id },
        data: {
          title,
          slug,
          image,
          sortOrder: parsed.data.sortOrder,
          active: parsed.data.active,
          showInHome: parsed.data.showInHome,
          showInShop: parsed.data.showInShop,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          title,
          slug,
          image,
          sortOrder: parsed.data.sortOrder,
          active: parsed.data.active,
          showInHome: parsed.data.showInHome,
          showInShop: parsed.data.showInShop,
        },
      });
    }
  } catch {
    return { ok: false as const, error: "اسلاگ تکراری یا خطای ذخیره" };
  }

  revalidateCatalog();
  return { ok: true as const };
}

export async function deleteCategoryAction(id: string) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };
  await prisma.category.delete({ where: { id } });
  revalidateCatalog();
  return { ok: true as const };
}

/* ─── Products ─── */

export async function saveProductFullAction(input: {
  id?: string;
  title: string;
  code: string;
  price: number;
  shaneh: number;
  density?: number;
  description: string;
  image: string;
  active: boolean;
  colorTag?: string | null;
  /** اگر undefined باشد دسته‌ها دست نمی‌خورند */
  categoryIds?: string[];
  gallery: string[];
  availableSizes?: string[];
  /** @deprecated ignored — inventory removed */
  stock?: number;
}) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };

  const parsed = parseProductInput(input);
  if (!parsed.ok) return { ok: false as const, error: parsed.error };

  const {
    id,
    title,
    code,
    price,
    stock,
    shaneh,
    density,
    description,
    image: imageUrl,
    active,
    colorTag,
    categoryIds,
    gallery,
    availableSizesJson,
  } = parsed.data;

  const productIdInput = id?.trim() || "";

  if (categoryIds !== undefined && categoryIds.length === 0) {
    return { ok: false as const, error: "حداقل یک گروه انتخاب کنید" };
  }

  let productId = productIdInput;
  const existing = productId
    ? await prisma.product.findUnique({
        where: { id: productId },
        include: { categories: true },
      })
    : null;

  let collection = existing?.collection ?? "classic";

  if (categoryIds !== undefined) {
    const cats = categoryIds.length
      ? await prisma.category.findMany({ where: { id: { in: categoryIds } } })
      : [];
    collection = cats[0]?.slug ?? collection;
  }

  if (productId && existing) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        code,
        price,
        stock,
        shaneh,
        density,
        description,
        image: imageUrl || existing.image || "",
        active,
        collection,
        availableSizes: availableSizesJson,
        ...(colorTag !== undefined ? { colorTag: colorTag || null } : {}),
      },
    });
    await prisma.productImage.deleteMany({ where: { productId } });
  } else {
    productId = `p-${Date.now()}`;
    await prisma.product.create({
      data: {
        id: productId,
        title,
        code,
        price,
        stock,
        shaneh,
        density,
        description,
        image: imageUrl,
        active,
        collection,
        colorTag: colorTag?.trim() || null,
        availableSizes: availableSizesJson,
      },
    });
  }

  if (categoryIds !== undefined) {
    await prisma.productCategory.deleteMany({ where: { productId } });
    if (categoryIds.length) {
      await prisma.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({ productId, categoryId })),
      });
    }
  }

  if (gallery.length) {
    await prisma.productImage.createMany({
      data: gallery.map((url, i) => ({ productId, url, sortOrder: i })),
    });
  }

  revalidateCatalog();
  revalidatePath(`/rugs/${productId}`);
  return { ok: true as const, id: productId };
}

function titleFromFilename(name: string) {
  const base = name.replace(/\.[^.]+$/, "").trim();
  const cleaned = base
    .replace(/[_+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 200) || "فرش بدون عنوان";
}

/** آپلود گروهی: هر عکس یک محصول (عنوان از اسم فایل) */
export async function bulkCreateProductsAction(input: {
  items: { filename: string; imageUrl: string }[];
  shaneh: number;
  density?: number;
  price?: number;
  active?: boolean;
  categoryIds?: string[];
  availableSizes?: string[];
}) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };

  const items = input.items
    .map((it) => ({
      filename: String(it.filename ?? "").trim(),
      imageUrl: sanitizeImageUrl(String(it.imageUrl ?? "").trim()) ?? "",
    }))
    .filter((it) => it.imageUrl);

  if (!items.length) return { ok: false as const, error: "هیچ عکسی برای ساخت محصول نیست" };
  if (items.length > 150) return { ok: false as const, error: "حداکثر ۱۵۰ فایل در هر بار" };
  const shaneh = Math.round(Number(input.shaneh));
  if (!Number.isFinite(shaneh) || shaneh < 20 || shaneh > 5000) {
    return { ok: false as const, error: "شانه نامعتبر است" };
  }
  const density = Math.max(0, Math.floor(Number(input.density ?? 0)));
  if (!Number.isFinite(density) || density > 99_999_999) {
    return { ok: false as const, error: "تراکم نامعتبر است" };
  }

  const price = Math.max(0, Math.floor(input.price ?? 0));
  const active = input.active !== false;
  const categoryIds = (input.categoryIds ?? []).filter(Boolean);
  const availableSizesJson = serializeAvailableSizes(
    input.availableSizes?.length ? input.availableSizes : ALL_SIZE_IDS,
  );

  let collection = "classic";
  if (categoryIds.length) {
    const cats = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
    collection = cats[0]?.slug ?? collection;
  }

  const stamp = Date.now();
  const createdIds: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < items.length; i++) {
      const it = items[i]!;
      const productId = `p-${stamp}-${i}-${Math.random().toString(36).slice(2, 7)}`;
      const code = `P-${String(stamp).slice(-6)}${String(i).padStart(3, "0")}`;
      await tx.product.create({
        data: {
          id: productId,
          title: titleFromFilename(it.filename),
          code,
          price,
          stock: CATALOG_STOCK,
          shaneh,
          density,
          description: "",
          image: it.imageUrl,
          active,
          collection,
          colorTag: null,
          availableSizes: availableSizesJson,
        },
      });
      await tx.productImage.create({
        data: { productId, url: it.imageUrl, sortOrder: 0 },
      });
      if (categoryIds.length) {
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({ productId, categoryId })),
        });
      }
      createdIds.push(productId);
    }
  });

  revalidateCatalog();
  return { ok: true as const, ids: createdIds, count: createdIds.length };
}

/** ویرایش گروهی شانه (و اختیاری دسته) روی محصولات انتخاب‌شده */
export async function bulkUpdateProductsAction(input: {
  productIds: string[];
  shaneh?: number;
  categoryIds?: string[];
  active?: boolean;
  price?: number;
}) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };

  const productIds = [...new Set(input.productIds.map((id) => id.trim()).filter(Boolean))];
  if (!productIds.length) return { ok: false as const, error: "محصولی انتخاب نشده" };
  if (productIds.length > 200) return { ok: false as const, error: "حداکثر ۲۰۰ محصول در هر بار" };

  if (input.shaneh !== undefined) {
    const shaneh = Math.round(Number(input.shaneh));
    if (!Number.isFinite(shaneh) || shaneh < 20 || shaneh > 5000) {
      return { ok: false as const, error: "شانه نامعتبر است" };
    }
  }

  const data: {
    shaneh?: number;
    active?: boolean;
    price?: number;
    collection?: string;
  } = {};
  if (input.shaneh !== undefined) data.shaneh = input.shaneh;
  if (input.active !== undefined) data.active = input.active;
  if (input.price !== undefined) data.price = Math.max(0, Math.floor(input.price));

  if (input.categoryIds !== undefined) {
    const categoryIds = input.categoryIds.filter(Boolean);
    const cats = categoryIds.length
      ? await prisma.category.findMany({ where: { id: { in: categoryIds } } })
      : [];
    if (categoryIds.length) data.collection = cats[0]?.slug ?? "classic";

    await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) {
        await tx.product.updateMany({ where: { id: { in: productIds } }, data });
      }
      await tx.productCategory.deleteMany({
        where: { productId: { in: productIds } },
      });
      if (categoryIds.length) {
        await tx.productCategory.createMany({
          data: productIds.flatMap((productId) =>
            categoryIds.map((categoryId) => ({ productId, categoryId })),
          ),
        });
      }
    });
  } else if (Object.keys(data).length) {
    await prisma.product.updateMany({ where: { id: { in: productIds } }, data });
  } else {
    return { ok: false as const, error: "هیچ تغییری انتخاب نشده" };
  }

  revalidateCatalog();
  return { ok: true as const, count: productIds.length };
}

/** محصولات یک دسته را یکجا تنظیم می‌کند (انتساب گروهی) */
export async function setCategoryProductsAction(categoryId: string, productIds: string[]) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };

  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat) return { ok: false as const, error: "دسته پیدا نشد" };

  await prisma.productCategory.deleteMany({ where: { categoryId } });
  if (productIds.length) {
    await prisma.productCategory.createMany({
      data: productIds.map((productId) => ({ productId, categoryId })),
    });
    // sync primary collection for products that had none matching
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { collection: cat.slug },
    });
  }

  revalidateCatalog();
  return { ok: true as const };
}

export async function quickUpdateProductAction(input: {
  id: string;
  price?: number;
  active?: boolean;
}) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };
  await prisma.product.update({
    where: { id: input.id },
    data: {
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
  revalidateCatalog();
  return { ok: true as const };
}

export async function deleteProductAction(id: string) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };

  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } });
    revalidateCatalog();
    return {
      ok: true as const,
      soft: true as const,
      message: "محصول در سفارش بوده؛ غیرفعال شد",
    };
  }

  await prisma.product.delete({ where: { id } });
  revalidateCatalog();
  return { ok: true as const, soft: false as const };
}

/* ─── Orders ─── */

export async function setOrderStatusAction(orderId: string, status: OrderStatus) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false as const, error: "سفارش یافت نشد" };

  if (order.status === status) {
    return { ok: true as const };
  }

  const allowed = ORDER_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    return { ok: false as const, error: "تغییر وضعیت مجاز نیست" };
  }

  await prisma.$transaction(async (tx) => {
    if (status === "PAID" && order.status === "PENDING_PAYMENT") {
      await markOrderPaid(tx, orderId, order.items);
      return;
    }

    await tx.order.update({ where: { id: orderId }, data: { status } });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

/* ─── Homepage / Settings / Media ─── */

export async function saveHomepageSectionAction(input: {
  id: string;
  title: string;
  enabled: boolean;
  sortOrder: number;
  payload: string;
}) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };

  const payload = input.payload || "{}";
  const payloadCheck = homepagePayloadSchema.safeParse(payload);
  if (!payloadCheck.success) {
    return { ok: false as const, error: "محتوای بخش بیش از حد بزرگ است" };
  }
  try {
    JSON.parse(payload);
  } catch {
    return { ok: false as const, error: "JSON نامعتبر است" };
  }
  await prisma.homepageSection.update({
    where: { id: input.id },
    data: {
      title: input.title.trim(),
      enabled: input.enabled,
      sortOrder: input.sortOrder,
      payload,
    },
  });
  revalidateContent();
  return { ok: true as const };
}

export async function saveSiteSettingAction(key: string, value: unknown) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: JSON.stringify(value) },
    update: { value: JSON.stringify(value) },
  });
  revalidateContent();
  return { ok: true as const };
}

export async function deleteMediaAction(id: string) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { ok: false as const, error: "رسانه یافت نشد" };

  if (isLocalUploadUrl(asset.url)) {
    await deleteStoredFile(asset.url);
  }

  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
  return { ok: true as const };
}

/* ─── Articles ─── */

function revalidateArticles(slug?: string) {
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/articles/${slug}`, "page");
}

export async function saveArticleAction(input: {
  id?: string;
  slug?: string;
  title: string;
  excerpt?: string;
  contentHtml?: string;
  coverImage?: string;
  published?: boolean;
  metaTitle?: string;
  metaDesc?: string;
}) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };

  const parsed = articleInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "اطلاعات مقاله نامعتبر است" };
  }

  const title = parsed.data.title.trim();
  const excerpt = parsed.data.excerpt.trim();
  const contentHtml = sanitizeArticleHtml(parsed.data.contentHtml);
  const coverImage = sanitizeImageUrl(parsed.data.coverImage) ?? "";
  const published = parsed.data.published;
  const metaTitle = parsed.data.metaTitle.trim();
  const metaDesc = parsed.data.metaDesc.trim();

  const requestedSlug = parsed.data.slug?.trim();
  let slug: string;

  try {
    if (parsed.data.id) {
      const existing = await prisma.article.findUnique({ where: { id: parsed.data.id } });
      if (!existing) return { ok: false as const, error: "مقاله یافت نشد" };

      const base = requestedSlug || existing.slug || title;
      slug = await uniqueSlug(base, async (s) => {
        const clash = await prisma.article.findUnique({ where: { slug: s } });
        return Boolean(clash && clash.id !== parsed.data.id);
      });

      const publishedAt =
        published && !existing.published
          ? new Date()
          : published
            ? existing.publishedAt ?? new Date()
            : null;

      await prisma.article.update({
        where: { id: parsed.data.id },
        data: {
          title,
          slug,
          excerpt,
          contentHtml,
          coverImage,
          published,
          publishedAt,
          metaTitle,
          metaDesc,
        },
      });

      revalidateArticles(existing.slug);
      if (slug !== existing.slug) revalidateArticles(slug);
    } else {
      slug = await uniqueSlug(requestedSlug || title, async (s) => {
        const clash = await prisma.article.findUnique({ where: { slug: s } });
        return Boolean(clash);
      });

      await prisma.article.create({
        data: {
          title,
          slug,
          excerpt,
          contentHtml,
          coverImage,
          published,
          publishedAt: published ? new Date() : null,
          metaTitle,
          metaDesc,
        },
      });
      revalidateArticles(slug);
    }
  } catch {
    return { ok: false as const, error: "خطا در ذخیره مقاله" };
  }

  return { ok: true as const, slug };
}

export async function deleteArticleAction(id: string) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return { ok: false as const, error: "مقاله یافت نشد" };
  await prisma.article.delete({ where: { id } });
  revalidateArticles(existing.slug);
  return { ok: true as const };
}

export async function toggleArticlePublishedAction(id: string, published: boolean) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return { ok: false as const, error: "مقاله یافت نشد" };

  await prisma.article.update({
    where: { id },
    data: {
      published,
      publishedAt: published ? existing.publishedAt ?? new Date() : null,
    },
  });
  revalidateArticles(existing.slug);
  return { ok: true as const };
}
