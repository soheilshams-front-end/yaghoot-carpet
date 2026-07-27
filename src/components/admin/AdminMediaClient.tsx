"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { deleteMediaAction } from "@/lib/admin/actions";
import { useConfirm } from "@/components/ConfirmProvider";

type Media = { id: string; url: string; alt: string; createdAt: string };

export function AdminMediaClient({ items }: { items: Media[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState("");

  function copy(url: string) {
    void navigator.clipboard.writeText(url);
    setCopied(url);
    window.setTimeout(() => setCopied(""), 1500);
  }

  async function remove(id: string) {
    const ok = await confirm({
      title: "حذف از کتابخانه",
      description: "این رسانه از کتابخانه حذف می‌شود. فایل روی دیسک ممکن است باقی بماند.",
      confirmLabel: "حذف رسانه",
      tone: "danger",
    });
    if (!ok) return;
    start(async () => {
      await deleteMediaAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">کتابخانه رسانه</h2>
        <p className="text-sm text-[var(--sa-text-muted)]">آپلود و کپی URL</p>
      </div>

      <div className="rounded-2xl border border-[var(--sa-border)] bg-white p-4">
        <ImageUploadField
          label="آپلود تصویر جدید"
          value=""
          onChange={() => router.refresh()}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <article
            key={m.id}
            className="overflow-hidden rounded-2xl border border-[var(--sa-border)] bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt} className="aspect-[3/4] w-full object-cover" />
            <div className="space-y-1.5 p-2.5">
              <p className="truncate text-[10px] text-[var(--sa-text-muted)]" dir="ltr">
                {m.url}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => copy(m.url)}
                  className="flex-1 rounded-lg bg-[var(--sa-navy)] py-1.5 text-[11px] text-[var(--sa-text-on-navy)]"
                >
                  {copied === m.url ? "کپی شد" : "کپی URL"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(m.id)}
                  className="rounded-lg border border-red-200 px-2 text-[11px] text-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <p className="text-center text-sm text-[var(--sa-text-muted)]">هنوز فایلی آپلود نشده</p>
      )}
    </div>
  );
}
