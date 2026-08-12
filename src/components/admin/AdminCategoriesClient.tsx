"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  deleteCategoryAction,
  saveCategoryAction,
  setCategoryProductsAction,
} from "@/lib/admin/actions";
import type { CmsCategory } from "@/lib/cms";
import type { AdminProduct } from "@/lib/products";
import { AdminHeader } from "@/components/admin/AdminShell";
import { AdminQuickProduct } from "@/components/admin/AdminQuickProduct";
import { formatPrice } from "@/data/rugs";
import { adminHref } from "@/lib/admin-path";
import { SaCheckbox } from "@/components/SaCheckbox";
import { useConfirm } from "@/components/ConfirmProvider";
import type { ColorFilterItem, ShanehFilterItem } from "@/lib/filters";

const empty = {
  id: "",
  slug: "",
  title: "",
  image: "",
  sortOrder: 0,
  active: true,
  showInHome: true,
  showInShop: true,
};

type Props = {
  categories: CmsCategory[];
  products: AdminProduct[];
  shanehOptions: ShanehFilterItem[];
  colorOptions: ColorFilterItem[];
};

export function AdminCategoriesClient({
  categories,
  products,
  shanehOptions,
  colorOptions,
}: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [mode, setMode] = useState<"list" | "edit" | "assign">("list");
  const [form, setForm] = useState({ ...empty });
  const [assignId, setAssignId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [initialSelected, setInitialSelected] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);

  const assignCat = categories.find((c) => c.id === assignId) ?? null;

  const productPool = useMemo(() => {
    const s = q.trim();
    if (!s) return products;
    return products.filter((p) => p.title.includes(s) || p.code.includes(s));
  }, [products, q]);

  function openAssign(c: CmsCategory) {
    const ids = products.filter((p) => p.categoryIds.includes(c.id)).map((p) => p.id);
    setAssignId(c.id);
    setSelected(ids);
    setInitialSelected(ids);
    setMode("assign");
    setMsg("");
  }

  async function backFromAssign() {
    const dirty =
      selected.length !== initialSelected.length ||
      selected.some((id) => !initialSelected.includes(id));
    if (dirty) {
      const ok = await confirm({
        title: "تغییرات ذخیره نشده",
        description: "تغییرات ذخیره نشده‌اند. از این صفحه خارج می‌شوید؟",
        confirmLabel: "خروج بدون ذخیره",
        cancelLabel: "ماندن",
        tone: "warn",
      });
      if (!ok) return;
    }
    setMode("list");
    setAssignId(null);
    setMsg("");
  }

  async function removeCategory(c: CmsCategory) {
    const ok = await confirm({
      title: "حذف گروه",
      description: `گروه «${c.title}» حذف شود؟ محصولات حذف نمی‌شوند، فقط از این گروه جدا می‌شوند.`,
      confirmLabel: "حذف گروه",
      tone: "danger",
    });
    if (!ok) return;
    start(async () => {
      await deleteCategoryAction(c.id);
      router.refresh();
    });
  }

  function openEdit(c?: CmsCategory) {
    if (c) setForm({ ...c });
    else setForm({ ...empty, sortOrder: categories.length + 1 });
    setMode("edit");
    setMsg("");
  }

  function saveCat(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveCategoryAction({
        id: form.id || undefined,
        slug: form.slug || undefined,
        title: form.title,
        image: form.image,
        sortOrder: form.sortOrder,
        active: form.active,
        showInHome: form.showInHome,
        showInShop: form.showInShop,
      });
      setMsg(res.ok ? "دسته ذخیره شد" : res.error);
      if (res.ok) {
        setMode("list");
        router.refresh();
      }
    });
  }

  function saveAssign() {
    if (!assignId) return;
    start(async () => {
      const res = await setCategoryProductsAction(assignId, selected);
      setMsg(res.ok ? "محصولات این گروه ذخیره شد" : res.error);
      if (res.ok) {
        setMode("list");
        setAssignId(null);
        router.refresh();
      }
    });
  }

  function toggleProduct(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  if (mode === "assign" && assignCat) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <AdminHeader
            title={`محصولات گروه «${assignCat.title}»`}
            subtitle="از کاتالوگ تیک بزنید یا همین‌جا محصول جدید بسازید"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              className="h-9 rounded-xl bg-[var(--sa-gold)] px-3 text-xs font-semibold"
            >
              محصول جدید در این گروه
            </button>
            <button type="button" onClick={backFromAssign} className="text-sm text-[var(--sa-text-muted)]">
              بازگشت
            </button>
          </div>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو در کاتالوگ…"
          className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2.5 text-sm"
        />

        <p className="text-xs text-[var(--sa-text-muted)]">
          {new Intl.NumberFormat("fa-IR").format(selected.length)} محصول انتخاب شده
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {productPool.map((p) => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProduct(p.id)}
                className={`relative overflow-hidden rounded-2xl border text-right transition ${
                  on
                    ? "border-[var(--sa-navy)] bg-[var(--sa-bg)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--sa-gold)_35%,transparent)]"
                    : "border-[var(--sa-border)] bg-[var(--sa-bg)] hover:border-[var(--sa-gold)]"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute left-2.5 top-2.5 z-10 h-2.5 w-2.5 rounded-full border-2 border-white shadow transition ${
                    on ? "scale-110 bg-[var(--sa-gold)]" : "scale-100 bg-white/90"
                  }`}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="aspect-[3/4] w-full object-cover" />
                <div className="p-2">
                  <p className="line-clamp-1 text-xs font-semibold">{p.title}</p>
                  <p className="text-[10px] text-[var(--sa-text-muted)]">
                    {p.shaneh} شانه · {formatPrice(p.price)}
                  </p>
                  <p className={`mt-1 text-[10px] font-medium ${on ? "text-[var(--sa-navy)]" : "text-[var(--sa-text-muted)]"}`}>
                    {on ? "در این گروه" : "افزودن"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {!products.length && (
          <p className="text-sm text-[var(--sa-text-muted)]">
            هنوز محصولی نیست — «محصول جدید در این گروه» را بزنید.
          </p>
        )}

        {msg && <p className="text-sm">{msg}</p>}
        <button
          type="button"
          disabled={pending}
          onClick={saveAssign}
          className="h-11 w-full rounded-xl bg-[var(--sa-navy)] text-sm text-[var(--sa-text-on-navy)] disabled:opacity-50"
        >
          {pending ? "…" : "ذخیره محصولات این گروه"}
        </button>

        <AdminQuickProduct
          open={quickOpen}
          onClose={() => setQuickOpen(false)}
          categories={categories}
          presetCategoryId={assignCat.id}
          title={`محصول جدید · ${assignCat.title}`}
          shanehOptions={shanehOptions}
          colorOptions={colorOptions}
          onSaved={(id) => {
            setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]));
            setMsg("محصول ساخته و به این گروه اضافه شد — در پایان «ذخیره» را بزنید");
            router.refresh();
          }}
        />
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <form onSubmit={saveCat} className="mx-auto max-w-lg space-y-4">
        <div className="flex items-start justify-between">
          <AdminHeader title={form.id ? "ویرایش گروه" : "گروه جدید"} subtitle="نام، عکس و محل نمایش" />
          <button type="button" onClick={() => setMode("list")} className="text-sm text-[var(--sa-text-muted)]">
            بازگشت
          </button>
        </div>
        <div className="space-y-3 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4">
          <label className="block text-sm">
            <span className="mb-1 block">نام گروه</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-[var(--sa-border)] px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">اسلاگ (اختیاری)</span>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full rounded-xl border border-[var(--sa-border)] px-3 py-2.5 text-sm"
              dir="ltr"
            />
          </label>
          <ImageUploadField value={form.image} onChange={(image) => setForm((f) => ({ ...f, image }))} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-0.5">
            <SaCheckbox
              checked={form.showInShop}
              onChange={(showInShop) => setForm((f) => ({ ...f, showInShop }))}
              label="فروشگاه / فوتر"
            />
            <SaCheckbox
              checked={form.showInHome}
              onChange={(showInHome) => setForm((f) => ({ ...f, showInHome }))}
              label="صفحه اصلی و فیلتر فروشگاه"
            />
            <SaCheckbox
              checked={form.active}
              onChange={(active) => setForm((f) => ({ ...f, active }))}
              label="فعال"
            />
          </div>
        </div>
        {msg && <p className="text-sm">{msg}</p>}
        <button type="submit" disabled={pending} className="h-11 w-full rounded-xl bg-[var(--sa-gold)] text-sm font-semibold disabled:opacity-50">
          ذخیره گروه
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminHeader
          title="گروه‌ها و دسته‌ها"
          subtitle="گروه بسازید، بعد محصولات کاتالوگ را داخلش بچینید"
        />
        <button
          type="button"
          onClick={() => openEdit()}
          className="h-10 rounded-xl bg-[var(--sa-navy)] px-4 text-sm text-[var(--sa-text-on-navy)]"
        >
          گروه جدید
        </button>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--sa-border)] bg-white/70 px-4 py-3 text-xs leading-6 text-[var(--sa-text-muted)]">
        اول در{" "}
        <Link href={adminHref("/products")} className="font-semibold text-[var(--sa-navy)] underline">
          کاتالوگ
        </Link>{" "}
        محصول بسازید، بعد اینجا با دکمه «انتخاب محصولات» به هر گروه اضافه کنید.
      </div>

      {msg && <p className="text-sm">{msg}</p>}

      <ul className="space-y-2.5">
        {categories.map((c) => {
          const count = products.filter((p) => p.categoryIds.includes(c.id)).length;
          return (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image || "/shah-abbasi/rug-1.jpg"}
                alt=""
                className="h-16 w-12 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--sa-navy)]">{c.title}</p>
                <p className="text-[11px] text-[var(--sa-text-muted)]">
                  {new Intl.NumberFormat("fa-IR").format(count)} محصول
                  {c.showInShop ? " · فروشگاه/فوتر" : ""}
                  {c.showInHome ? " · خانه+فیلتر" : ""}
                  {!c.active ? " · غیرفعال" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => openAssign(c)}
                  className="h-8 rounded-lg bg-[var(--sa-navy)] px-3 text-[11px] text-[var(--sa-text-on-navy)]"
                >
                  انتخاب محصولات
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="h-8 rounded-lg border border-[var(--sa-border)] bg-white px-3 text-[11px]"
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void removeCategory(c)}
                  className="h-8 rounded-lg border border-red-200 px-2 text-[11px] text-red-700"
                >
                  حذف
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
