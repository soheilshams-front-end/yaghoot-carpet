"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteStoredFile, isLocalUploadUrl } from "@/lib/storage";
import { ORDER_TRANSITIONS } from "@/lib/admin/order-status";
import type { OrderStatus } from "@/generated/prisma/client";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "")
    .replace(/-+/g, "-")
    .slice(0, 64) || `cat-${Date.now()}`;
}

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
  const title = input.title.trim();
  if (!title) return { ok: false as const, error: "عنوان الزامی است" };
  const slug = (input.slug?.trim() || slugify(title)).toLowerCase();

  try {
    if (input.id) {
      await prisma.category.update({
        where: { id: input.id },
        data: {
          title,
          slug,
          image: input.image,
          sortOrder: input.sortOrder,
          active: input.active,
          showInHome: input.showInHome,
          showInShop: input.showInShop,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          title,
          slug,
          image: input.image,
          sortOrder: input.sortOrder,
          active: input.active,
          showInHome: input.showInHome,
          showInShop: input.showInShop,
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
  stock: number;
  shaneh: number;
  description: string;
  image: string;
  active: boolean;
  colorTag?: string | null;
  /** اگر undefined باشد دسته‌ها دست نمی‌خورند */
  categoryIds?: string[];
  gallery: string[];
}) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };

  const title = input.title.trim();
  const code = input.code.trim();
  if (!title || !code || !Number.isFinite(input.price)) {
    return { ok: false as const, error: "اطلاعات ناقص است" };
  }

  const gallery = (input.gallery.length ? input.gallery : [input.image]).filter(Boolean);
  const imageUrl = input.image.trim() || gallery[0] || "";
  const stock = Number.isFinite(input.stock) ? Math.max(0, Math.floor(input.stock)) : 0;
  const isNew = !input.id?.trim();

  if (isNew && !imageUrl) {
    return { ok: false as const, error: "عکس محصول لازم است" };
  }
  if (input.categoryIds !== undefined && input.categoryIds.length === 0) {
    return { ok: false as const, error: "حداقل یک گروه انتخاب کنید" };
  }
  if (input.active && stock < 1) {
    return {
      ok: false as const,
      error: "محصول فعال با موجودی صفر در فروشگاه «ناموجود» دیده می‌شود — موجودی را حداقل ۱ بگذارید",
    };
  }

  let productId = input.id?.trim() || "";
  const existing = productId
    ? await prisma.product.findUnique({
        where: { id: productId },
        include: { categories: true },
      })
    : null;

  let collection = existing?.collection ?? "classic";

  if (input.categoryIds !== undefined) {
    const cats = input.categoryIds.length
      ? await prisma.category.findMany({ where: { id: { in: input.categoryIds } } })
      : [];
    collection = cats[0]?.slug ?? collection;
  }

  if (productId && existing) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        code,
        price: input.price,
        stock,
        shaneh: input.shaneh,
        description: input.description,
        image: imageUrl || existing.image || "",
        active: input.active,
        collection,
        ...(input.colorTag !== undefined ? { colorTag: input.colorTag || null } : {}),
      },
    });
    await prisma.productImage.deleteMany({ where: { productId } });
  } else {
    productId = `p-${Date.now()}`;
    const effectiveStock = stock < 1 ? 1 : stock;
    await prisma.product.create({
      data: {
        id: productId,
        title,
        code,
        price: input.price,
        stock: effectiveStock,
        shaneh: input.shaneh,
        description: input.description,
        image: imageUrl,
        active: input.active,
        collection,
        colorTag: input.colorTag?.trim() || null,
      },
    });
  }

  if (input.categoryIds !== undefined) {
    await prisma.productCategory.deleteMany({ where: { productId } });
    if (input.categoryIds.length) {
      await prisma.productCategory.createMany({
        data: input.categoryIds.map((categoryId) => ({ productId, categoryId })),
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
  stock?: number;
  active?: boolean;
}) {
  if (!(await requireAdmin())) return { ok: false as const, error: "دسترسی غیرمجاز" };
  await prisma.product.update({
    where: { id: input.id },
    data: {
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
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

const STOCK_HELD_STATUSES = new Set<OrderStatus>(["PAID", "PREPARING", "SHIPPING"]);

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
    if (status === "CANCELLED" && STOCK_HELD_STATUSES.has(order.status)) {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.qty } },
        });
      }
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
  try {
    JSON.parse(input.payload || "{}");
  } catch {
    return { ok: false as const, error: "JSON نامعتبر است" };
  }
  await prisma.homepageSection.update({
    where: { id: input.id },
    data: {
      title: input.title.trim(),
      enabled: input.enabled,
      sortOrder: input.sortOrder,
      payload: input.payload || "{}",
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
