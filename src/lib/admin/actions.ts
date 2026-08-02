"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteStoredFile, isLocalUploadUrl } from "@/lib/storage";
import { ORDER_TRANSITIONS } from "@/lib/admin/order-status";
import { markOrderPaid } from "@/lib/order-payment";
import {
  categoryInputSchema,
  homepagePayloadSchema,
  parseProductInput,
} from "@/lib/validation";
import { sanitizeImageUrl } from "@/lib/safe-image-url";
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

  const parsed = parseProductInput(input);
  if (!parsed.ok) return { ok: false as const, error: parsed.error };

  const {
    id,
    title,
    code,
    price,
    stock: rawStock,
    shaneh,
    description,
    image: imageUrl,
    active,
    colorTag,
    categoryIds,
    gallery,
  } = parsed.data;

  const stock = Math.max(0, Math.floor(rawStock));
  const isNew = !id?.trim();
  const productIdInput = id?.trim() || "";

  if (categoryIds !== undefined && categoryIds.length === 0) {
    return { ok: false as const, error: "حداقل یک گروه انتخاب کنید" };
  }
  if (active && stock < 1) {
    return {
      ok: false as const,
      error: "محصول فعال با موجودی صفر در فروشگاه «ناموجود» دیده می‌شود — موجودی را حداقل ۱ بگذارید",
    };
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
        description,
        image: imageUrl || existing.image || "",
        active,
        collection,
        ...(colorTag !== undefined ? { colorTag: colorTag || null } : {}),
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
        price,
        stock: effectiveStock,
        shaneh,
        description,
        image: imageUrl,
        active,
        collection,
        colorTag: colorTag?.trim() || null,
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
