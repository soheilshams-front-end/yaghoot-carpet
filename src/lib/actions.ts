"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { resolveSize } from "@/lib/sizes";

export type CheckoutItemInput = {
  productId: string;
  sizeId: string;
  qty: number;
};

const checkoutSchema = z.object({
  address: z.string().trim().min(8),
  city: z.string().trim().min(2),
  phone: z.string().trim().min(10),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        sizeId: z.string().min(1),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1),
});

function generateOrderCode() {
  const d = new Date();
  const stamp = [
    d.getFullYear().toString().slice(-2),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
    String(d.getHours()).padStart(2, "0"),
    String(d.getMinutes()).padStart(2, "0"),
  ].join("");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${stamp}${rand}`;
}

export async function createOrderAction(input: {
  address: string;
  city: string;
  phone: string;
  items: CheckoutItemInput[];
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "لطفاً وارد شوید", needAuth: true as const };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.join(".") ?? "";
    if (path.includes("city")) {
      return { ok: false as const, error: "لطفاً شهر را وارد کنید", needAddress: true as const };
    }
    if (path.includes("address")) {
      return {
        ok: false as const,
        error: "آدرس کامل را وارد کنید (حداقل ۸ کاراکتر)",
        needAddress: true as const,
      };
    }
    if (path.includes("phone")) {
      return { ok: false as const, error: "شماره تماس معتبر نیست" };
    }
    if (path.includes("items") && !input.items?.length) {
      return { ok: false as const, error: "سبد خالی است" };
    }
    return { ok: false as const, error: "اطلاعات سفارش نامعتبر است" };
  }

  const { city, address, phone, items } = parsed.data;
  if (phone.replace(/\D/g, "").length < 10) {
    return { ok: false as const, error: "شماره تماس معتبر نیست" };
  }

  for (const item of items) {
    if (!resolveSize(item.sizeId)) {
      return { ok: false as const, error: "سایز انتخاب‌شده معتبر نیست" };
    }
  }

  const demand = new Map<string, number>();
  for (const item of items) {
    demand.set(item.productId, (demand.get(item.productId) ?? 0) + item.qty);
  }

  const productIds = [...demand.keys()];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const [productId, qty] of demand) {
    const product = byId.get(productId);
    if (!product) {
      return { ok: false as const, error: "محصول یافت نشد یا غیرفعال است" };
    }
    if (product.stock < qty) {
      return { ok: false as const, error: `موجودی «${product.title}» کافی نیست` };
    }
  }

  let total = 0;
  const lines: {
    productId: string;
    sizeId: string;
    sizeLabel: string;
    factor: number;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }[] = [];

  for (const item of items) {
    const product = byId.get(item.productId)!;
    const size = resolveSize(item.sizeId)!;
    const lineTotal = Math.round(product.price * size.factor * item.qty);
    total += lineTotal;
    lines.push({
      productId: product.id,
      sizeId: size.id,
      sizeLabel: size.label,
      factor: size.factor,
      qty: item.qty,
      unitPrice: product.price,
      lineTotal,
    });
  }

  const authority = `SA${Date.now()}${Math.floor(Math.random() * 1000)}`;

  async function createWithCode(code: string) {
    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session!.user!.id },
        data: { city, address, phone },
      });

      return tx.order.create({
        data: {
          code,
          userId: session!.user!.id,
          status: "PENDING_PAYMENT",
          address,
          city,
          phone,
          total,
          paymentRef: authority,
          items: { create: lines },
        },
      });
    });
  }

  let order;
  try {
    order = await createWithCode(generateOrderCode());
  } catch {
    try {
      order = await createWithCode(generateOrderCode());
    } catch {
      return { ok: false as const, error: "ثبت سفارش ناموفق بود؛ دوباره تلاش کنید" };
    }
  }

  return {
    ok: true as const,
    orderId: order.id,
    code: order.code,
    authority,
    total,
  };
}

export async function confirmPaymentAction(authority: string, success: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "لطفاً وارد شوید" };
  }

  const order = await prisma.order.findFirst({
    where: { paymentRef: authority, userId: session.user.id },
    include: { items: true },
  });

  if (!order) return { ok: false as const, error: "سفارش یافت نشد" };

  if (!success) {
    const cancelled = await prisma.order.updateMany({
      where: { id: order.id, status: "PENDING_PAYMENT" },
      data: { status: "CANCELLED" },
    });
    if (cancelled.count === 0) {
      return { ok: false as const, error: "این سفارش قابل لغو نیست", orderId: order.id };
    }
    return { ok: false as const, error: "پرداخت لغو شد", orderId: order.id };
  }

  if (order.status !== "PENDING_PAYMENT") {
    if (order.status === "PAID" || order.status === "PREPARING" || order.status === "SHIPPING" || order.status === "DELIVERED") {
      revalidatePath("/dashboard");
      return { ok: true as const, orderId: order.id, code: order.code };
    }
    return { ok: false as const, error: "وضعیت سفارش برای پرداخت معتبر نیست", orderId: order.id };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const stockUpdate = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.qty } },
          data: { stock: { decrement: item.qty } },
        });
        if (stockUpdate.count === 0) {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      const statusUpdate = await tx.order.updateMany({
        where: { id: order.id, status: "PENDING_PAYMENT" },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });
      if (statusUpdate.count === 0) {
        throw new Error("STATUS_RACE");
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "INSUFFICIENT_STOCK") {
      return { ok: false as const, error: "موجودی کافی نیست", orderId: order.id };
    }
    if (msg === "STATUS_RACE") {
      const fresh = await prisma.order.findUnique({ where: { id: order.id } });
      if (fresh && fresh.status !== "PENDING_PAYMENT" && fresh.status !== "CANCELLED") {
        revalidatePath("/dashboard");
        return { ok: true as const, orderId: order.id, code: order.code };
      }
      return { ok: false as const, error: "تأیید پرداخت ناموفق بود", orderId: order.id };
    }
    return { ok: false as const, error: "تأیید پرداخت ناموفق بود", orderId: order.id };
  }

  revalidatePath("/dashboard");
  return { ok: true as const, orderId: order.id, code: order.code };
}

export async function toggleWishlistAction(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "لطفاً وارد شوید", needAuth: true as const };
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard");
    return { ok: true as const, added: false };
  }

  await prisma.wishlistItem.create({
    data: { userId: session.user.id, productId },
  });
  revalidatePath("/dashboard");
  return { ok: true as const, added: true };
}

export async function removeWishlistAction(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const };
  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, productId },
  });
  revalidatePath("/dashboard");
  return { ok: true as const };
}
