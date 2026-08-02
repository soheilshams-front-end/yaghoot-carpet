"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatPrice } from "@/data/rugs";
import { setOrderStatusAction } from "@/lib/admin/actions";
import { allowedOrderStatuses } from "@/lib/admin/order-status";
import { STATUSES } from "@/components/admin/AdminOrdersClient";
import { adminHref } from "@/lib/admin-path";
import { SaSelect } from "@/components/SaSelect";
import type { OrderStatus } from "@/generated/prisma/client";
import { formatOrderAddress } from "@/lib/format-address";

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
  const [error, setError] = useState("");
  const statusOptions = allowedOrderStatuses(order.status);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">سفارش {order.code}</h2>
          <p className="text-sm text-[var(--sa-text-muted)]">{order.createdAt}</p>
        </div>
        <Link href={adminHref("/orders")} className="text-sm underline">
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
          {formatOrderAddress(order.city, order.address)}
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
          <SaSelect
            disabled={pending}
            value={order.status}
            onChange={(v) => {
              const status = v as OrderStatus;
              if (status === order.status) return;
              start(async () => {
                const res = await setOrderStatusAction(order.id, status);
                if (!res.ok) {
                  setError(res.error);
                  return;
                }
                setError("");
                router.refresh();
              });
            }}
            options={statusOptions.map((value) => ({
              value,
              label: STATUSES.find((s) => s.value === value)?.label ?? value,
            }))}
          />
          {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
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
