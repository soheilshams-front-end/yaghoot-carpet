import { prisma } from "@/lib/db";
import type { OrderStatus } from "@/generated/prisma/client";
import type { Rug } from "@/data/rugs";

export type DashOrder = {
  id: string;
  code: string;
  rugId: string;
  rugTitle: string;
  status: OrderStatus;
  statusLabel: string;
  date: string;
  size: string;
  progress: number;
  total: number;
  paymentRef: string | null;
  rug?: Rug;
  timeline: { label: string; done: boolean }[];
};

export type DashUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  memberSince: string;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PAID: "ثبت‌شده",
  PREPARING: "در حال آماده‌سازی",
  SHIPPING: "در حال ارسال",
  DELIVERED: "تحویل شده",
  CANCELLED: "لغو شده",
};

const STATUS_PROGRESS: Record<OrderStatus, number> = {
  PENDING_PAYMENT: 10,
  PAID: 25,
  PREPARING: 45,
  SHIPPING: 75,
  DELIVERED: 100,
  CANCELLED: 0,
};

function timelineFor(status: OrderStatus) {
  const steps = ["ثبت", "آماده‌سازی", "ارسال", "تحویل"] as const;
  const index =
    status === "PENDING_PAYMENT"
      ? -1
      : status === "PAID"
        ? 0
        : status === "PREPARING"
          ? 1
          : status === "SHIPPING"
            ? 2
            : status === "DELIVERED"
              ? 3
              : -1;
  return steps.map((label, i) => ({
    label,
    done: index >= i,
  }));
}

function faDate(d: Date) {
  return new Intl.DateTimeFormat("fa-IR").format(d);
}

export async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [ordersRaw, wishlistRaw] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        code: true,
        status: true,
        total: true,
        paymentRef: true,
        createdAt: true,
        items: {
          select: {
            sizeLabel: true,
            product: {
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const orders: DashOrder[] = ordersRaw.map((o) => {
    const first = o.items[0];
    const product = first?.product;
    return {
      id: o.id,
      code: o.code,
      rugId: product?.id ?? "",
      rugTitle: product?.title ?? `${o.items.length} قلم`,
      status: o.status,
      statusLabel: STATUS_LABEL[o.status],
      date: faDate(o.createdAt),
      size: first ? `${first.sizeLabel} متر` : "—",
      progress: STATUS_PROGRESS[o.status],
      total: o.total,
      paymentRef: o.paymentRef,
      rug: product
        ? {
            id: product.id,
            title: product.title,
            code: product.code,
            price: product.price,
            shaneh: product.shaneh as Rug["shaneh"],
            collection: product.collection as Rug["collection"],
            image: product.image,
            stock: product.stock,
            description: product.description,
          }
        : undefined,
      timeline: timelineFor(o.status),
    };
  });

  const wishlist: Rug[] = wishlistRaw.map((w) => ({
    id: w.product.id,
    title: w.product.title,
    code: w.product.code,
    price: w.product.price,
    shaneh: w.product.shaneh as Rug["shaneh"],
    collection: w.product.collection as Rug["collection"],
    image: w.product.image,
    stock: w.product.stock,
    description: w.product.description,
  }));

  const dashUser: DashUser = {
    id: user.id,
    name: user.name ?? "کاربر",
    email: user.email ?? "—",
    phone: user.phone,
    city: user.city ?? "—",
    address: user.address ?? "—",
    memberSince: faDate(user.createdAt),
  };

  return { user: dashUser, orders, wishlist };
}
