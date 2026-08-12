"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminShell";
import { SaSelect } from "@/components/SaSelect";
import { SaCheckChip } from "@/components/SaCheckChip";
import { TomanPriceInput } from "@/components/admin/TomanPriceInput";
import { AvailableSizesField } from "@/components/admin/AvailableSizesField";
import { bulkCreateProductsAction } from "@/lib/admin/actions";
import { adminHref } from "@/lib/admin-path";
import type { CmsCategory } from "@/lib/cms";
import type { ShanehFilterItem } from "@/lib/filters";
import { ALL_SIZE_IDS, type SizeId } from "@/lib/sizes";

const CONCURRENCY = 3;

type Props = {
  categories: CmsCategory[];
  shanehOptions: ShanehFilterItem[];
};

type Row = {
  key: string;
  file: File;
  status: "queued" | "uploading" | "saving" | "done" | "error";
  error?: string;
  url?: string;
};

export function AdminBulkUploadClient({ categories, shanehOptions }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [rows, setRows] = useState<Row[]>([]);
  const [shaneh, setShaneh] = useState(shanehOptions[0]?.shaneh ?? 700);
  const [price, setPrice] = useState(0);
  const [active, setActive] = useState(true);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<SizeId[]>([...ALL_SIZE_IDS]);
  const [msg, setMsg] = useState("");
  const [running, setRunning] = useState(false);

  const shanehSelect = shanehOptions.length
    ? shanehOptions
    : [{ shaneh: 700 }, { shaneh: 1000 }, { shaneh: 1200 }, { shaneh: 1500 }];

  const stats = useMemo(() => {
    const done = rows.filter((r) => r.status === "done").length;
    const err = rows.filter((r) => r.status === "error").length;
    return { total: rows.length, done, err };
  }, [rows]);

  function onPick(files: FileList | null) {
    if (!files?.length) return;
    const next: Row[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      next.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        status: "queued",
      });
    }
    setRows((prev) => [...prev, ...next].slice(0, 150));
    setMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function toggleCat(id: string) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function patchRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  async function uploadOne(file: File): Promise<string> {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("alt", file.name);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
    if (!res.ok || !json.ok || !json.url) {
      throw new Error(json.error || "آپلود ناموفق");
    }
    return json.url;
  }

  async function runUpload() {
    if (!rows.length || running) return;
    setRunning(true);
    setMsg("");

    const queue = rows.filter((r) => r.status === "queued" || r.status === "error");
    let cursor = 0;
    const uploaded: { key: string; filename: string; imageUrl: string }[] = [];

    async function worker() {
      while (cursor < queue.length) {
        const idx = cursor++;
        const row = queue[idx]!;
        patchRow(row.key, { status: "uploading", error: undefined });
        try {
          const url = await uploadOne(row.file);
          uploaded.push({ key: row.key, filename: row.file.name, imageUrl: url });
          patchRow(row.key, { status: "saving", url });
        } catch (e) {
          patchRow(row.key, {
            status: "error",
            error: e instanceof Error ? e.message : "خطا",
          });
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker()),
    );

    if (!uploaded.length) {
      setRunning(false);
      setMsg("هیچ فایلی آمادهٔ ساخت محصول نشد");
      return;
    }

    start(async () => {
      const res = await bulkCreateProductsAction({
        items: uploaded.map((u) => ({
          filename: u.filename,
          imageUrl: u.imageUrl,
        })),
        shaneh,
        price,
        active,
        categoryIds,
        availableSizes,
      });

      if (!res.ok) {
        setMsg(res.error);
        const failKeys = new Set(uploaded.map((u) => u.key));
        setRows((prev) =>
          prev.map((r) =>
            failKeys.has(r.key) ? { ...r, status: "error", error: res.error } : r,
          ),
        );
        setRunning(false);
        return;
      }

      const okKeys = new Set(uploaded.map((u) => u.key));
      setRows((prev) =>
        prev.map((r) => (okKeys.has(r.key) ? { ...r, status: "done" } : r)),
      );
      setMsg(`${res.count} محصول ساخته شد`);
      setRunning(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminHeader
          title="آپلود گروهی محصولات"
          subtitle="چندین عکس را یکجا انتخاب کنید؛ هر عکس یک محصول می‌شود. بعداً از کاتالوگ شانه را گروهی عوض کنید."
        />
        <Link
          href={adminHref("/products")}
          className="inline-flex h-10 items-center rounded-xl border border-[var(--sa-border)] bg-white px-4 text-sm text-[var(--sa-navy)]"
        >
          بازگشت به کاتالوگ
        </Link>
      </div>

      <div className="grid gap-4 rounded-2xl border border-[var(--sa-border)] bg-white/80 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--sa-text-muted)]">شانه پیش‌فرض</span>
          <SaSelect
            value={String(shaneh)}
            onChange={(v) => setShaneh(Number(v))}
            options={shanehSelect.map((s) => ({
              value: String(s.shaneh),
              label: `${s.shaneh} شانه`,
            }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--sa-text-muted)]">قیمت ۱۲ متری (۳×۴) — تومان</span>
          <TomanPriceInput
            showLabel={false}
            value={price}
            onChange={setPrice}
            className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--sa-gold)]"
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4"
          />
          <span>نمایش در فروشگاه (فعال)</span>
        </label>
        <div className="sm:col-span-2 lg:col-span-4">
          <AvailableSizesField value={availableSizes} onChange={setAvailableSizes} />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <p className="mb-2 text-sm text-[var(--sa-text-muted)]">گروه (اختیاری)</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <SaCheckChip
                key={c.id}
                selected={categoryIds.includes(c.id)}
                onClick={() => toggleCat(c.id)}
              >
                {c.title}
              </SaCheckChip>
            ))}
            {!categories.length && (
              <p className="text-xs text-[var(--sa-text-muted)]">هنوز گروهی نساخته‌اید</p>
            )}
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border border-dashed border-[var(--sa-border)] bg-[var(--sa-bg)] px-4 py-10 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onPick(e.dataTransfer.files);
        }}
      >
        <p className="font-semibold text-[var(--sa-navy)]">عکس‌ها را بکشید اینجا یا انتخاب کنید</p>
        <p className="mt-1 text-xs text-[var(--sa-text-muted)]">
          JPG / PNG / WebP — حداکثر ۱۵۰ فایل — عنوان از اسم فایل ساخته می‌شود
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-[var(--sa-navy)] px-4 text-sm text-[var(--sa-text-on-navy)]"
        >
          انتخاب فایل‌ها
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => onPick(e.target.files)}
        />
      </div>

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[var(--sa-navy)]">
              {stats.total} فایل · {stats.done} موفق · {stats.err} خطا
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={running || pending}
                onClick={() => setRows([])}
                className="h-9 rounded-xl border border-[var(--sa-border)] bg-white px-3 text-xs"
              >
                پاک کردن لیست
              </button>
              <button
                type="button"
                disabled={running || pending || !rows.some((r) => r.status === "queued" || r.status === "error")}
                onClick={() => void runUpload()}
                className="h-9 rounded-xl bg-[var(--sa-gold)] px-4 text-xs font-semibold text-[var(--sa-text)] disabled:opacity-50"
              >
                {running || pending ? "در حال آپلود…" : "شروع آپلود و ساخت محصولات"}
              </button>
            </div>
          </div>

          <ul className="max-h-[28rem] space-y-1.5 overflow-y-auto rounded-2xl border border-[var(--sa-border)] bg-white p-2">
            {rows.map((r) => (
              <li
                key={r.key}
                className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-xs hover:bg-[var(--sa-bg)]"
              >
                <span className="min-w-0 truncate text-[var(--sa-navy)]">{r.file.name}</span>
                <span
                  className={
                    r.status === "done"
                      ? "shrink-0 text-emerald-700"
                      : r.status === "error"
                        ? "shrink-0 text-red-700"
                        : "shrink-0 text-[var(--sa-text-muted)]"
                  }
                >
                  {r.status === "queued" && "در صف"}
                  {r.status === "uploading" && "آپلود…"}
                  {r.status === "saving" && "ثبت…"}
                  {r.status === "done" && "ثبت شد"}
                  {r.status === "error" && (r.error || "خطا")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {msg && <p className="text-sm font-medium text-[var(--sa-navy)]">{msg}</p>}
    </div>
  );
}
