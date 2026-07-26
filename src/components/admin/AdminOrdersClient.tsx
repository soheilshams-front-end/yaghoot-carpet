"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { formatPrice } from "@/data/rugs";
import { setOrderStatusAction } from "@/lib/admin/actions";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "PENDING_PAYMENT", label: "در انتظار پرداخت" },
  { value: "PAID", label: "پرداخت‌شده" },
  { value: "PREPARING", label: "آماده‌سازی" },
  { value: "SHIPPING", label: "ارسال" },
  { value: "DELIVERED", label: "تحویل" },
  { value: "CANCELLED", label: "لغو" },
];

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

  function changeStatus(id: string, status: OrderStatus) {
    start(async () => {
      await setOrderStatusAction(id, status);
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
                  <select
                    disabled={pending}
                    value={o.status}
                    onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                    className="rounded-lg border border-[var(--sa-border)] px-2 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <Link href={`/admin/orders/${o.id}`} className="text-xs underline">
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

export { STATUSES };
