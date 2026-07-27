"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatPrice } from "@/data/rugs";
import { setOrderStatusAction } from "@/lib/admin/actions";
import { allowedOrderStatuses } from "@/lib/admin/order-status";
import { adminHref } from "@/lib/admin-path";
import { SaSelect } from "@/components/SaSelect";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  PREPARING: "آماده‌سازی",
  SHIPPING: "ارسال",
  DELIVERED: "تحویل",
  CANCELLED: "لغو",
};

export const STATUSES = (Object.keys(STATUS_LABELS) as OrderStatus[]).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

export type AdminOrderRow = {
  id: string;
  code: string;
  status: OrderStatus;
  city: string;
  phone: string;
  total: number;
  createdAt: string;
  userName: string | null;
  itemCount: number;
};

export function AdminOrdersClient({ orders }: { orders: AdminOrderRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  function changeStatus(id: string, status: OrderStatus, current: OrderStatus) {
    if (status === current) return;
    start(async () => {
      const res = await setOrderStatusAction(id, status);
      if (!res.ok) {
        setMsg(res.error);
        return;
      }
      setMsg("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">سفارش‌ها</h2>
        <p className="text-sm text-[var(--sa-text-muted)]">
          {new Intl.NumberFormat("fa-IR").format(orders.length)} سفارش
        </p>
      </div>

      {msg && <p className="text-sm text-red-700">{msg}</p>}

      <div className="overflow-x-auto rounded-2xl border border-[var(--sa-border)] bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--sa-cream)] text-xs text-[var(--sa-text-muted)]">
            <tr>
              <th className="px-3 py-2.5 text-right">کد</th>
              <th className="px-3 py-2.5 text-right">مشتری</th>
              <th className="px-3 py-2.5 text-right">مبلغ</th>
              <th className="px-3 py-2.5 text-right">وضعیت</th>
              <th className="px-3 py-2.5 text-right">جزئیات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[var(--sa-border)]">
                <td className="px-3 py-2.5 font-semibold">{o.code}</td>
                <td className="px-3 py-2.5">
                  <p>{o.userName || "—"}</p>
                  <p className="text-[11px] text-[var(--sa-text-muted)]">
                    {o.city} · {o.phone} · {o.itemCount} قلم
                  </p>
                </td>
                <td className="px-3 py-2.5">{formatPrice(o.total)}</td>
                <td className="px-3 py-2.5">
                  <SaSelect
                    size="sm"
                    disabled={pending}
                    value={o.status}
                    onChange={(v) => changeStatus(o.id, v as OrderStatus, o.status)}
                    options={allowedOrderStatuses(o.status).map((value) => ({
                      value,
                      label: STATUS_LABELS[value],
                    }))}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <Link href={adminHref(`/orders/${o.id}`)} className="text-xs underline">
                    مشاهده
                  </Link>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-[var(--sa-text-muted)]">
                  سفارشی ثبت نشده
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
