"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatPrice } from "@/data/rugs";
import type { AdminProduct } from "@/lib/products";
import type { CmsCategory } from "@/lib/cms";
import {
  bulkUpdateProductsAction,
  deleteProductAction,
  quickUpdateProductAction,
} from "@/lib/admin/actions";
import { AdminHeader } from "@/components/admin/AdminShell";
import { AdminQuickProduct } from "@/components/admin/AdminQuickProduct";
import { SaSelect } from "@/components/SaSelect";
import { adminHref } from "@/lib/admin-path";
import { useConfirm } from "@/components/ConfirmProvider";
import type { ColorFilterItem, ShanehFilterItem } from "@/lib/filters";

const ease = [0.22, 1, 0.36, 1] as const;

export function AdminProductsClient({
  items,
  categories,
  shanehOptions,
  colorOptions,
}: {
  items: AdminProduct[];
  categories: CmsCategory[];
  shanehOptions: ShanehFilterItem[];
  colorOptions: ColorFilterItem[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const shanehSelect = shanehOptions.length
    ? shanehOptions
    : [{ shaneh: 700 }, { shaneh: 1000 }, { shaneh: 1200 }, { shaneh: 1500 }];
  const [bulkShaneh, setBulkShaneh] = useState(shanehSelect[0]?.shaneh ?? 700);

  const filtered = useMemo(() => {
    const s = q.trim();
    if (!s) return items;
    return items.filter(
      (p) => p.title.includes(s) || p.code.includes(s) || String(p.shaneh).includes(s),
    );
  }, [items, q]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const p of filtered) next.delete(p.id);
      } else {
        for (const p of filtered) next.add(p.id);
      }
      return next;
    });
  }

  async function remove(id: string, title: string) {
    const ok = await confirm({
      title: "حذف محصول",
      description: `«${title}» از کاتالوگ حذف شود؟ این عمل قابل بازگشت نیست.`,
      confirmLabel: "حذف محصول",
      tone: "danger",
    });
    if (!ok) return;
    start(async () => {
      const res = await deleteProductAction(id);
      setMsg(!res.ok ? res.error : res.soft ? res.message : "حذف شد");
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      router.refresh();
    });
  }

  function applyBulkShaneh() {
    const ids = [...selected];
    if (!ids.length) {
      setMsg("اول چند محصول را انتخاب کنید");
      return;
    }
    start(async () => {
      const res = await bulkUpdateProductsAction({
        productIds: ids,
        shaneh: bulkShaneh,
      });
      if (!res.ok) {
        setMsg(res.error);
        return;
      }
      setMsg(`شانه ${bulkShaneh} روی ${res.count} محصول اعمال شد`);
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminHeader
          title="کاتالوگ محصولات"
          subtitle="آپلود گروهی برای صدها عکس؛ بعد با انتخاب، شانه را یکجا عوض کنید"
        />
        <div className="flex flex-wrap gap-2">
          <Link
            href={adminHref("/products/bulk")}
            className="inline-flex h-10 items-center rounded-xl border border-[var(--sa-gold)] bg-[var(--sa-gold)]/15 px-4 text-sm font-semibold text-[var(--sa-navy)]"
          >
            آپلود گروهی
          </Link>
          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            className="inline-flex h-10 items-center rounded-xl bg-[var(--sa-gold)] px-4 text-sm font-semibold text-[var(--sa-text)]"
          >
            افزودن سریع
          </button>
          <Link
            href={adminHref("/products/new")}
            className="inline-flex h-10 items-center rounded-xl bg-[var(--sa-navy)] px-4 text-sm text-[var(--sa-text-on-navy)]"
          >
            فرم کامل
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--sa-border)] bg-white/70 px-4 py-3 text-xs leading-6 text-[var(--sa-text-muted)]">
        برای صد طرح: «آپلود گروهی» → همه عکس‌ها. بعد تیک بزنید و با یک دکمه همه را مثلاً ۷۰۰ شانه کنید. گروه‌ها از{" "}
        <Link href={adminHref("/categories")} className="underline">
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

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--sa-border)] bg-white px-3 py-2.5">
        <label className="flex items-center gap-2 text-xs text-[var(--sa-navy)]">
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleAllFiltered}
            className="h-4 w-4"
          />
          انتخاب همهٔ نتایج ({filtered.length})
        </label>
        <span className="text-xs text-[var(--sa-text-muted)]">
          انتخاب‌شده: {selected.size}
        </span>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <div className="w-36">
            <SaSelect
              value={String(bulkShaneh)}
              onChange={(v) => setBulkShaneh(Number(v))}
              options={shanehSelect.map((s) => ({
                value: String(s.shaneh),
                label: `${s.shaneh} شانه`,
              }))}
            />
          </div>
          <button
            type="button"
            disabled={pending || selected.size === 0}
            onClick={applyBulkShaneh}
            className="h-9 rounded-xl bg-[var(--sa-navy)] px-3 text-xs text-[var(--sa-text-on-navy)] disabled:opacity-50"
          >
            اعمال شانه روی انتخاب‌شده‌ها
          </button>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="h-9 rounded-xl border border-[var(--sa-border)] px-3 text-xs"
            >
              لغو انتخاب
            </button>
          )}
        </div>
      </div>

      {msg && <p className="text-sm text-[var(--sa-navy)]">{msg}</p>}

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 24) * 0.02, duration: 0.35, ease }}
            className={`overflow-hidden rounded-2xl border bg-[var(--sa-bg)] ${
              selected.has(p.id)
                ? "border-[var(--sa-gold)] ring-2 ring-[var(--sa-gold)]/35"
                : "border-[var(--sa-border)]"
            }`}
          >
            <div className="relative aspect-[2/3] bg-[var(--sa-navy-deep)] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.title}
                className="h-full w-full object-contain object-center"
              />
              <label className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-white/95 shadow">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleOne(p.id)}
                  className="h-4 w-4"
                  aria-label={`انتخاب ${p.title}`}
                />
              </label>
              {!p.active && (
                <span className="absolute left-2 top-2 rounded-full bg-[var(--sa-navy)]/90 px-2 py-0.5 text-[10px] text-white">
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
                  href={adminHref(`/products/${p.id}`)}
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
          <p className="mt-1 text-sm text-[var(--sa-text-muted)]">با آپلود گروهی شروع کنید</p>
          <Link
            href={adminHref("/products/bulk")}
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-[var(--sa-gold)] px-4 text-sm font-semibold"
          >
            آپلود گروهی
          </Link>
        </div>
      )}

      <AdminQuickProduct
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        categories={categories}
        shanehOptions={shanehOptions}
        colorOptions={colorOptions}
        onSaved={() => {
          setMsg("محصول اضافه شد");
          router.refresh();
        }}
      />
    </div>
  );
}
