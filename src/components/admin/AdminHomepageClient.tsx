"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { saveHomepageSectionAction } from "@/lib/admin/actions";
import type { HomepageSectionRow } from "@/lib/cms";
import { AdminHeader } from "@/components/admin/AdminShell";

type Draft = {
  title: string;
  enabled: boolean;
  sortOrder: number;
  payload: Record<string, unknown>;
};

const HINTS: Record<string, string> = {
  hero: "عکس بزرگ و برچسب‌های کناری صفحه اول",
  categories: "شبکه دسته‌ها از بخش «گروه‌ها» می‌آید",
  newest: "کاروسل جدیدترین محصولات",
  popular: "ردیف محبوب‌ترین‌ها",
  shaneh: "کاشی‌های فیلتر شانه — قابل ویرایش (صفحه اول + فروشگاه)",
  colors: "اکسپلورر رنگ — قابل ویرایش (صفحه اول + فروشگاه)",
  silk: "سکشن ابریشم",
  guarantees: "کارت‌های چرا یاقوت",
  faq: "سوالات متداول",
};

export function AdminHomepageClient({ sections }: { sections: HomepageSectionRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      sections.map((s) => [
        s.id,
        {
          title: s.title,
          enabled: s.enabled,
          sortOrder: s.sortOrder,
          payload: { ...s.payload },
        },
      ]),
    ),
  );

  const ordered = [...sections].sort(
    (a, b) => (drafts[a.id]?.sortOrder ?? a.sortOrder) - (drafts[b.id]?.sortOrder ?? b.sortOrder),
  );

  function patch(id: string, partial: Partial<Draft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id]!, ...partial } }));
  }

  function patchPayload(id: string, partial: Record<string, unknown>) {
    setDrafts((d) => ({
      ...d,
      [id]: { ...d[id]!, payload: { ...d[id]!.payload, ...partial } },
    }));
  }

  function move(id: string, dir: -1 | 1) {
    const list = ordered.map((s) => s.id);
    const i = list.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const a = list[i]!;
    const b = list[j]!;
    const sa = drafts[a]!.sortOrder;
    const sb = drafts[b]!.sortOrder;
    const nextA = { ...drafts[a]!, sortOrder: sb };
    const nextB = { ...drafts[b]!, sortOrder: sa };
    setDrafts((d) => ({ ...d, [a]: nextA, [b]: nextB }));
    start(async () => {
      await saveHomepageSectionAction({
        id: a,
        title: nextA.title,
        enabled: nextA.enabled,
        sortOrder: nextA.sortOrder,
        payload: JSON.stringify(nextA.payload),
      });
      await saveHomepageSectionAction({
        id: b,
        title: nextB.title,
        enabled: nextB.enabled,
        sortOrder: nextB.sortOrder,
        payload: JSON.stringify(nextB.payload),
      });
      router.refresh();
    });
  }

  function toggleEnabled(id: string) {
    const d = drafts[id];
    if (!d) return;
    const nextEnabled = !d.enabled;
    patch(id, { enabled: nextEnabled });
    setMsg("در حال ذخیره…");
    start(async () => {
      const res = await saveHomepageSectionAction({
        id,
        title: d.title,
        enabled: nextEnabled,
        sortOrder: d.sortOrder,
        payload: JSON.stringify(d.payload),
      });
      setMsg(res.ok ? "ذخیره شد" : res.error);
      if (res.ok) router.refresh();
    });
  }
  function save(id: string) {
    const d = drafts[id];
    if (!d) return;
    start(async () => {
      const res = await saveHomepageSectionAction({
        id,
        title: d.title,
        enabled: d.enabled,
        sortOrder: d.sortOrder,
        payload: JSON.stringify(d.payload),
      });
      setMsg(res.ok ? "ذخیره شد" : res.error);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <AdminHeader
        title="صفحه اصلی"
        subtitle="هر بخش را روشن/خاموش کنید، جابه‌جا کنید، و محتوایش را ساده ویرایش کنید"
      />
      {msg && <p className="text-sm text-[var(--sa-navy)]">{msg}</p>}

      <ul className="space-y-2.5">
        {ordered.map((s) => {
          const d = drafts[s.id]!;
          const expanded = openId === s.id;
          return (
            <li
              key={s.id}
              className="overflow-hidden rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)]"
            >
              <div className="flex flex-wrap items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--sa-navy)]">{d.title}</p>
                  <p className="text-[11px] text-[var(--sa-text-muted)]">
                    {HINTS[s.key] ?? s.key}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(s.id, -1)}
                    className="h-8 w-8 rounded-lg border border-[var(--sa-border)] bg-white text-sm"
                    aria-label="بالا"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(s.id, 1)}
                    className="h-8 w-8 rounded-lg border border-[var(--sa-border)] bg-white text-sm"
                    aria-label="پایین"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEnabled(s.id)}
                  disabled={pending}
                  className={`h-8 rounded-full px-3 text-[11px] font-medium disabled:opacity-50 ${
                    d.enabled
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {d.enabled ? "روشن" : "خاموش"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : s.id)}
                  className="h-8 rounded-lg border border-[var(--sa-border)] bg-white px-3 text-[11px]"
                >
                  {expanded ? "بستن" : "ویرایش"}
                </button>
              </div>

              {expanded && (
                <div className="space-y-3 border-t border-[var(--sa-border)] bg-white/60 p-4">
                  <label className="block text-sm">
                    <span className="mb-1 block">عنوان نمایشی</span>
                    <input
                      value={d.title}
                      onChange={(e) => patch(s.id, { title: e.target.value })}
                      className="w-full rounded-xl border border-[var(--sa-border)] px-3 py-2 text-sm"
                    />
                  </label>

                  {s.key === "hero" && (
                    <ImageUploadField
                      label="عکس هیرو"
                      value={String(d.payload.image ?? "")}
                      onChange={(image) => patchPayload(s.id, { image })}
                    />
                  )}

                  {s.key === "popular" && (
                    <label className="block text-sm">
                      <span className="mb-1 block">عنوان سکشن محبوب‌ها</span>
                      <input
                        value={String(d.payload.title ?? "")}
                        onChange={(e) => patchPayload(s.id, { title: e.target.value })}
                        className="w-full rounded-xl border border-[var(--sa-border)] px-3 py-2 text-sm"
                      />
                    </label>
                  )}

                  {s.key === "faq" && (
                    <FaqEditor
                      items={(d.payload.items as { q: string; a: string }[]) ?? []}
                      onChange={(items) => patchPayload(s.id, { items })}
                    />
                  )}

                  {s.key === "guarantees" && (
                    <GuaranteesEditor
                      items={
                        (d.payload.items as {
                          title: string;
                          desc: string;
                          icon: string;
                          image: string;
                        }[]) ?? []
                      }
                      onChange={(items) => patchPayload(s.id, { items })}
                    />
                  )}

                  {s.key === "shaneh" && (
                    <ShanehItemsEditor
                      items={
                        (d.payload.items as {
                          shaneh: number;
                          image: string;
                          hint?: string;
                          label?: string;
                        }[]) ?? []
                      }
                      onChange={(items) => patchPayload(s.id, { items })}
                    />
                  )}

                  {s.key === "colors" && (
                    <ColorItemsEditor
                      items={
                        (d.payload.items as {
                          id: string;
                          label: string;
                          hex: string;
                          image: string;
                        }[]) ?? []
                      }
                      onChange={(items) => patchPayload(s.id, { items })}
                    />
                  )}

                  {(s.key === "categories" || s.key === "newest" || s.key === "silk") && (
                    <p className="text-xs leading-6 text-[var(--sa-text-muted)]">
                      محتوای این بخش از کاتالوگ / گروه‌ها یا تنظیمات پیش‌فرض سایت پر می‌شود.
                      کافی است روشن باشد و ترتیبش را تنظیم کنید.
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => save(s.id)}
                    className="h-10 w-full rounded-xl bg-[var(--sa-navy)] text-sm text-[var(--sa-text-on-navy)] disabled:opacity-50"
                  >
                    ذخیره این بخش
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FaqEditor({
  items,
  onChange,
}: {
  items: { q: string; a: string }[];
  onChange: (items: { q: string; a: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">سوالات</p>
      {items.map((item, i) => (
        <div key={i} className="space-y-1.5 rounded-xl border border-[var(--sa-border)] p-3">
          <input
            value={item.q}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, q: e.target.value };
              onChange(next);
            }}
            placeholder="سوال"
            className="w-full rounded-lg border border-[var(--sa-border)] px-2 py-1.5 text-sm"
          />
          <textarea
            value={item.a}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, a: e.target.value };
              onChange(next);
            }}
            placeholder="پاسخ"
            rows={2}
            className="w-full rounded-lg border border-[var(--sa-border)] px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-[11px] text-red-700"
          >
            حذف
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { q: "", a: "" }])}
        className="text-xs font-medium text-[var(--sa-navy)] underline"
      >
        + سوال جدید
      </button>
    </div>
  );
}

function GuaranteesEditor({
  items,
  onChange,
}: {
  items: { title: string; desc: string; icon: string; image: string }[];
  onChange: (items: { title: string; desc: string; icon: string; image: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">کارت‌های ضمانت</p>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-[var(--sa-border)] p-3">
          <input
            value={item.title}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, title: e.target.value };
              onChange(next);
            }}
            placeholder="عنوان"
            className="w-full rounded-lg border border-[var(--sa-border)] px-2 py-1.5 text-sm"
          />
          <input
            value={item.desc}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, desc: e.target.value };
              onChange(next);
            }}
            placeholder="توضیح کوتاه"
            className="w-full rounded-lg border border-[var(--sa-border)] px-2 py-1.5 text-sm"
          />
          <ImageUploadField
            label="عکس کارت"
            value={item.image}
            onChange={(image) => {
              const next = [...items];
              next[i] = { ...item, image };
              onChange(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}

function ShanehItemsEditor({
  items,
  onChange,
}: {
  items: { shaneh: number; image: string; hint?: string; label?: string }[];
  onChange: (items: { shaneh: number; image: string; hint?: string; label?: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">کاشی‌های شانه (صفحه اول + فیلتر فروشگاه)</p>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-[var(--sa-border)] p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs">
              <span className="mb-1 block">عدد شانه</span>
              <input
                type="number"
                value={item.shaneh}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...item, shaneh: Number(e.target.value) || 0 };
                  onChange(next);
                }}
                className="w-full rounded-lg border border-[var(--sa-border)] px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block">زیرعنوان / hint</span>
              <input
                value={item.hint ?? item.label ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...item, hint: e.target.value, label: e.target.value };
                  onChange(next);
                }}
                className="w-full rounded-lg border border-[var(--sa-border)] px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <ImageUploadField
            label="عکس کاشی"
            value={item.image}
            onChange={(image) => {
              const next = [...items];
              next[i] = { ...item, image };
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-[11px] text-red-700"
          >
            حذف
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...items, { shaneh: 1000, image: "", hint: "", label: "" }])
        }
        className="text-xs font-medium text-[var(--sa-navy)] underline"
      >
        + شانه جدید
      </button>
    </div>
  );
}

function ColorItemsEditor({
  items,
  onChange,
}: {
  items: { id: string; label: string; hex: string; image: string }[];
  onChange: (items: { id: string; label: string; hex: string; image: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">رنگ‌ها (صفحه اول + فیلتر فروشگاه)</p>
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-[var(--sa-border)] p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block text-xs">
              <span className="mb-1 block">شناسه (لاتین)</span>
              <input
                value={item.id}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = {
                    ...item,
                    id: e.target.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                  };
                  onChange(next);
                }}
                className="w-full rounded-lg border border-[var(--sa-border)] px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block">برچسب</span>
              <input
                value={item.label}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...item, label: e.target.value };
                  onChange(next);
                }}
                className="w-full rounded-lg border border-[var(--sa-border)] px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block">رنگ (hex)</span>
              <input
                value={item.hex}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...item, hex: e.target.value };
                  onChange(next);
                }}
                className="w-full rounded-lg border border-[var(--sa-border)] px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <ImageUploadField
            label="عکس رنگ"
            value={item.image}
            onChange={(image) => {
              const next = [...items];
              next[i] = { ...item, image };
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-[11px] text-red-700"
          >
            حذف
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...items, { id: "new-color", label: "فرش جدید", hex: "#888888", image: "" }])
        }
        className="text-xs font-medium text-[var(--sa-navy)] underline"
      >
        + رنگ جدید
      </button>
    </div>
  );
}
