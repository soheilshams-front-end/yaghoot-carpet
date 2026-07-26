"use client";

import { useState } from "react";

type Props = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
};

export function ImageUploadField({ value = "", onChange, label = "تصویر" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!data.ok || !data.url) throw new Error(data.error || "آپلود ناموفق");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در آپلود");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--sa-navy)]">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-20 w-16 rounded-lg border border-[var(--sa-border)] object-cover"
          />
        ) : (
          <div className="flex h-20 w-16 items-center justify-center rounded-lg border border-dashed border-[var(--sa-border)] text-[10px] text-[var(--sa-text-muted)]">
            بدون عکس
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/….webp یا URL"
            className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sa-gold)]"
          />
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-[var(--sa-border)] bg-white px-3 py-1.5 text-xs text-[var(--sa-navy)] hover:bg-[var(--sa-cream)]">
            {uploading ? "در حال فشرده‌سازی…" : "آپلود فایل"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="text-[10px] leading-5 text-[var(--sa-text-muted)]">
            JPG یا PNG بفرستید؛ بعد از آپلود خودکار WebP و سبک می‌شود (حداکثر ۱۶۰۰px).
          </p>
        </div>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
