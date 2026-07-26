"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { formatPrice } from "@/data/rugs";
import { setOrderStatusAction } from "@/lib/admin/actions";
import { STATUSES } from "@/components/admin/AdminOrdersClient";
import type { OrderStatus } from "@/generated/prisma/client";

export type OrderDetail = {
  id: string;
  code: string;
  status: OrderStatus;
  city: string;
  address: string;
  phone: string;
  total: number;
  paymentRef: string | null;
  createdAt: string;
  userName: string | null;
  items: {
    title: string;
    sizeLabel: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }[];
};

export function AdminOrderDetailClient({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">سفارش {order.code}</h2>
          <p className="text-sm text-[var(--sa-text-muted)]">{order.createdAt}</p>
        </div>
        <Link href="/admin/orders" className="text-sm underline">
          بازگشت
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--sa-border)] bg-white p-4 space-y-2 text-sm">
        <p>
          <span className="text-[var(--sa-text-muted)]">مشتری: </span>
          {order.userName || "—"}
        </p>
        <p>
          <span className="text-[var(--sa-text-muted)]">آدرس: </span>
          {order.city}، {order.address}
        </p>
        <p>
          <span className="text-[var(--sa-text-muted)]">تماس: </span>
          {order.phone}
        </p>
        {order.paymentRef && (
          <p>
            <span className="text-[var(--sa-text-muted)]">رفرنس پرداخت: </span>
            {order.paymentRef}
          </p>
        )}
        <label className="block pt-2">
          <span className="mb-1 block text-[var(--sa-text-muted)]">وضعیت</span>
          <select
            disabled={pending}
            value={order.status}
            onChange={(e) => {
              const status = e.target.value as OrderStatus;
              start(async () => {
                await setOrderStatusAction(order.id, status);
                router.refresh();
              });
            }}
            className="w-full rounded-xl border border-[var(--sa-border)] px-3 py-2"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="space-y-2 rounded-2xl border border-[var(--sa-border)] bg-white p-4">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between gap-3 text-sm">
            <span>
              {it.title} · {it.sizeLabel} × {it.qty}
            </span>
            <span className="font-semibold">{formatPrice(it.lineTotal)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-[var(--sa-border)] pt-2 font-bold">
          <span>جمع</span>
          <span>{formatPrice(order.total)}</span>
        </li>
      </ul>
    </div>
  );
}
