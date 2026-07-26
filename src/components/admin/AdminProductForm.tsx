"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { saveProductFullAction } from "@/lib/admin/actions";
import type { AdminProduct } from "@/lib/products";
import type { CmsCategory } from "@/lib/cms";
import { AdminHeader } from "@/components/admin/AdminShell";

const SHANEH = [700, 1000, 1200, 1500];
const inputClass =
  "w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--sa-gold)]";

type Props = {
  product: AdminProduct | null;
  categories: CmsCategory[];
};

export function AdminProductForm({ product, categories }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [title, setTitle] = useState(product?.title ?? "");
  const [code, setCode] = useState(product?.code ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [shaneh, setShaneh] = useState<number>(product?.shaneh ?? 1200);
  const [description, setDescription] = useState(product?.description ?? "");
  const [image, setImage] = useState(product?.image ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [categoryIds, setCategoryIds] = useState<string[]>(product?.categoryIds ?? []);
  const [gallery, setGallery] = useState<string[]>(
    product?.gallery?.length ? product.gallery : product?.image ? [product.image] : [],
  );

  function addGalleryUrl(url: string) {
    if (!url.trim()) return;
    setGallery((g) => [...g, url.trim()]);
    if (!image) setImage(url.trim());
  }

  function toggleCat(id: string) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await saveProductFullAction({
        id: product?.id,
        title,
        code: code.trim() || `P-${Date.now().toString().slice(-6)}`,
        price,
        stock,
        shaneh,
        description,
        image: image || gallery[0] || "",
        active,
        gallery: gallery.length ? gallery : image ? [image] : [],
        categoryIds,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <AdminHeader
          title={product ? "ویرایش محصول" : "محصول جدید در کاتالوگ"}
          subtitle="عکس، مشخصات و گروه اختیاری در یک جا"
        />
        <Link href="/admin/products" className="shrink-0 text-sm text-[var(--sa-text-muted)]">
          بازگشت
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4 space-y-3">
        <ImageUploadField label="عکس اصلی" value={image} onChange={setImage} />
        <label className="block text-sm">
          <span className="mb-1 block font-medium">نام فرش</span>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="مثلاً فرش کلاسیک نایین" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">کد / طرح</span>
            <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} placeholder="خالی = خودکار" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">شانه</span>
            <select value={shaneh} onChange={(e) => setShaneh(Number(e.target.value))} className={inputClass}>
              {SHANEH.map((s) => (
                <option key={s} value={s}>{s} شانه</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">قیمت (تومان)</span>
            <input type="number" required value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">موجودی</span>
            <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className={inputClass} />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">توضیح طرح</span>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="رنگ، نقش، جنس…" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          در فروشگاه نمایش داده شود
        </label>
      </div>

      {categories.length > 0 && (
        <div className="rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4 space-y-2">
          <p className="text-sm font-semibold">گروه‌ها (اختیاری)</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => {
              const on = categoryIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCat(c.id)}
                  className={`rounded-full px-3 py-1.5 text-[11px] ${
                    on
                      ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
                      : "border border-[var(--sa-border)] bg-white"
                  }`}
                >
                  {c.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4 space-y-3">
        <p className="text-sm font-semibold">عکس‌های بیشتر (اختیاری)</p>
        <div className="flex flex-wrap gap-2">
          {gallery.map((url, i) => (
            <div key={`${url}-${i}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-20 w-14 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setGallery((g) => g.filter((_, idx) => idx !== i))}
                className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <ImageUploadField label="افزودن عکس" value="" onChange={addGalleryUrl} />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-xl bg-[var(--sa-gold)] text-sm font-semibold disabled:opacity-50"
      >
        {pending ? "در حال ذخیره…" : "ذخیره در کاتالوگ"}
      </button>
    </form>
  );
}
