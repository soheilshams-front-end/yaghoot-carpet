"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatPrice } from "@/data/rugs";
import type { AdminProduct } from "@/lib/products";
import type { CmsCategory } from "@/lib/cms";
import {
  deleteProductAction,
  quickUpdateProductAction,
} from "@/lib/admin/actions";
import { AdminHeader } from "@/components/admin/AdminShell";
import { AdminQuickProduct } from "@/components/admin/AdminQuickProduct";

const ease = [0.22, 1, 0.36, 1] as const;

export function AdminProductsClient({
  items,
  categories,
}: {
  items: AdminProduct[];
  categories: CmsCategory[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim();
    if (!s) return items;
    return items.filter(
      (p) => p.title.includes(s) || p.code.includes(s) || String(p.shaneh).includes(s),
    );
  }, [items, q]);

  function remove(id: string, title: string) {
    if (!window.confirm(`«${title}» از کاتالوگ حذف شود؟`)) return;
    start(async () => {
      const res = await deleteProductAction(id);
      setMsg(!res.ok ? res.error : res.soft ? res.message : "حذف شد");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminHeader
          title="کاتالوگ محصولات"
          subtitle="با «افزودن سریع» عکس و مشخصات را بزنید؛ گروه اختیاری است"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            className="inline-flex h-10 items-center rounded-xl bg-[var(--sa-gold)] px-4 text-sm font-semibold text-[var(--sa-text)]"
          >
            افزودن سریع
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center rounded-xl bg-[var(--sa-navy)] px-4 text-sm text-[var(--sa-text-on-navy)]"
          >
            فرم کامل
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--sa-border)] bg-white/70 px-4 py-3 text-xs leading-6 text-[var(--sa-text-muted)]">
        عکس JPG/PNG آپلود کنید → خودکار WebP می‌شود. می‌توانید همان لحظه گروه را هم انتخاب کنید، یا بعداً از{" "}
        <Link href="/admin/categories" className="underline">
          گروه‌ها
        </Link>
        .
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="جستجو در کاتالوگ…"
        className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--sa-gold)]"
      />

      {msg && <p className="text-sm text-[var(--sa-navy)]">{msg}</p>}

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.35, ease }}
            className="overflow-hidden rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)]"
          >
            <div className="relative aspect-[3/4] bg-[var(--sa-navy)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
              {!p.active && (
                <span className="absolute right-2 top-2 rounded-full bg-[var(--sa-navy)]/90 px-2 py-0.5 text-[10px] text-white">
                  مخفی
                </span>
              )}
            </div>
            <div className="p-2.5 sm:p-3">
              <p className="line-clamp-1 text-sm font-semibold text-[var(--sa-navy)]">{p.title}</p>
              <p className="mt-0.5 text-[11px] text-[var(--sa-text-muted)]">
                کد {p.code} · {p.shaneh} شانه
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--sa-navy)]">
                {formatPrice(p.price)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[var(--sa-navy)] px-2 text-[11px] text-[var(--sa-text-on-navy)]"
                >
                  ویرایش
                </Link>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await quickUpdateProductAction({ id: p.id, active: !p.active });
                      router.refresh();
                    })
                  }
                  className="h-8 rounded-lg border border-[var(--sa-border)] bg-white px-2 text-[11px]"
                >
                  {p.active ? "مخفی" : "نمایش"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(p.id, p.title)}
                  className="h-8 rounded-lg border border-red-200 px-2 text-[11px] text-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {!filtered.length && (
        <div className="rounded-2xl border border-dashed border-[var(--sa-border)] bg-white py-12 text-center">
          <p className="font-semibold text-[var(--sa-navy)]">کاتالوگ خالی است</p>
          <p className="mt-1 text-sm text-[var(--sa-text-muted)]">اولین فرش را سریع اضافه کنید</p>
          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-[var(--sa-gold)] px-4 text-sm font-semibold"
          >
            افزودن سریع
          </button>
        </div>
      )}

      <AdminQuickProduct
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        categories={categories}
        onSaved={() => {
          setMsg("محصول اضافه شد");
          router.refresh();
        }}
      />
    </div>
  );
}
