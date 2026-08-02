"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconChevronDown, IconSliders, IconX } from "@/components/Icons";
import { colorFilters } from "@/data/site";

const SHANEH = [1500, 1200, 1000, 700] as const;

export type ShopFilterCategory = { id: string; title: string };

export type ShopFilterValues = {
  collection: string | null;
  shaneh: number | null;
  color: string | null;
};

type PanelProps = {
  categories: ShopFilterCategory[];
  values: ShopFilterValues;
  onChange: (next: ShopFilterValues) => void;
};

function toFa(n: number) {
  return new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(n);
}

const COLOR_LABELS: Record<string, string> = {
  navy: "سرمه‌ای",
  sky: "آبی",
  green: "سبز",
  yellow: "زرد",
  red: "لاکی",
  cream: "کرم",
  beige: "نسکافه‌ای",
  gray: "طوسی",
  black: "مشکی",
  brown: "موکا",
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center rounded-full px-2.5 text-[11px] font-medium transition sm:text-xs ${
        active
          ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] ring-1 ring-[var(--sa-gold)]"
          : "bg-white text-[var(--sa-navy)] ring-1 ring-[var(--sa-border)] hover:bg-[var(--sa-cream)]"
      }`}
    >
      {children}
    </button>
  );
}

function Accordion({
  title,
  defaultOpen = true,
  summary,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  summary?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="border-b border-[var(--sa-border)] last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 py-2.5 text-right"
      >
        <span className="min-w-0">
          <span className="block text-xs font-bold text-[var(--sa-navy)]">{title}</span>
          {!open && summary && (
            <span className="mt-0.5 block truncate text-[10px] text-[var(--sa-text-muted)]">
              {summary}
            </span>
          )}
        </span>
        <IconChevronDown
          size={14}
          className={`shrink-0 text-[var(--sa-text-muted)] transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div id={panelId} className="pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

/** Compact facet panel — chips + color swatch grid */
export function ShopFiltersPanel({ categories, values, onChange }: PanelProps) {
  const catSummary =
    categories.find((c) => c.id === values.collection)?.title ?? "همه";
  const shanehSummary =
    values.shaneh != null ? `${toFa(values.shaneh)} شانه` : "همه";
  const colorSummary = values.color
    ? COLOR_LABELS[values.color] ?? values.color
    : "همه";

  return (
    <div>
      <Accordion title="دسته" summary={catSummary} defaultOpen>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={!values.collection}
            onClick={() => onChange({ ...values, collection: null })}
          >
            همه
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.id}
              active={values.collection === c.id}
              onClick={() => onChange({ ...values, collection: c.id })}
            >
              {c.title.replace(/^فرش\s+/, "")}
            </Chip>
          ))}
        </div>
      </Accordion>

      <Accordion title="شانه" summary={shanehSummary} defaultOpen>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={values.shaneh == null}
            onClick={() => onChange({ ...values, shaneh: null })}
          >
            همه
          </Chip>
          {SHANEH.map((s) => (
            <Chip
              key={s}
              active={values.shaneh === s}
              onClick={() => onChange({ ...values, shaneh: s })}
            >
              {toFa(s)}
            </Chip>
          ))}
        </div>
      </Accordion>

      <Accordion title="رنگ" summary={colorSummary} defaultOpen={false}>
        <div className="grid grid-cols-5 gap-2">
          <button
            type="button"
            title="همه رنگ‌ها"
            aria-label="همه رنگ‌ها"
            aria-pressed={!values.color}
            onClick={() => onChange({ ...values, color: null })}
            className={`flex aspect-square items-center justify-center rounded-full text-[9px] font-bold ring-2 transition ${
              !values.color
                ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] ring-[var(--sa-gold)]"
                : "bg-white text-[var(--sa-navy)] ring-[var(--sa-border)]"
            }`}
          >
            همه
          </button>
          {colorFilters.map((c) => {
            const active = values.color === c.id;
            const label = COLOR_LABELS[c.id] ?? c.label;
            return (
              <button
                key={c.id}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={active}
                onClick={() => onChange({ ...values, color: c.id })}
                className={`aspect-square rounded-full ring-2 transition ${
                  active
                    ? "ring-[var(--sa-gold)] ring-offset-2 ring-offset-[var(--sa-cream)]"
                    : "ring-black/10 hover:ring-[var(--sa-navy)]/30"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
        {values.color && (
          <p className="mt-2 text-center text-[11px] text-[var(--sa-text-muted)]">
            {COLOR_LABELS[values.color] ?? values.color}
          </p>
        )}
      </Accordion>
    </div>
  );
}

type DesktopProps = PanelProps & { className?: string };

export function ShopFiltersSidebar({ className = "", ...panel }: DesktopProps) {
  return (
    <aside
      className={`hidden w-full shrink-0 self-start lg:block lg:w-[14.5rem] xl:w-[15.5rem] ${className}`}
    >
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)]/95 p-3 shadow-sm backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:thin]">
        <div className="mb-2 flex items-center gap-2 border-b border-[var(--sa-border)] pb-2.5">
          <IconSliders size={15} className="text-[var(--sa-gold)]" />
          <h2 className="text-sm font-bold text-[var(--sa-navy)]">فیلترها</h2>
        </div>
        <ShopFiltersPanel {...panel} />
      </div>
    </aside>
  );
}

type MobileProps = PanelProps & {
  resultCount: number;
};

/** Lightweight mobile bottom sheet — portal + CSS only (no Framer crash) */
export function ShopFiltersMobile({
  categories,
  values,
  onChange,
  resultCount,
}: MobileProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ShopFilterValues>(values);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setDraft(values);
  }, [open, values]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeCount = [values.collection, values.shaneh, values.color].filter(
    Boolean,
  ).length;

  function apply() {
    onChange(draft);
    setOpen(false);
  }

  function clearDraft() {
    setDraft({ collection: null, shaneh: null, color: null });
  }

  const sheet =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[80] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="فیلتر محصولات"
          >
            <button
              type="button"
              aria-label="بستن"
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 flex max-h-[min(85vh,640px)] flex-col rounded-t-2xl border border-[var(--sa-border)] bg-[var(--sa-cream)] shadow-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-[var(--sa-border)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <IconSliders size={16} className="text-[var(--sa-gold)]" />
                  <p className="text-sm font-bold text-[var(--sa-navy)]">فیلترها</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sa-bg)] text-[var(--sa-navy)]"
                  aria-label="بستن فیلتر"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 [-webkit-overflow-scrolling:touch]">
                <ShopFiltersPanel
                  categories={categories}
                  values={draft}
                  onChange={setDraft}
                />
              </div>

              <div className="flex shrink-0 gap-2 border-t border-[var(--sa-border)] bg-[var(--sa-bg)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={clearDraft}
                  className="h-11 flex-1 rounded-xl border border-[var(--sa-border)] bg-white text-sm font-medium text-[var(--sa-navy)]"
                >
                  پاک کردن
                </button>
                <button
                  type="button"
                  onClick={apply}
                  className="h-11 flex-[1.4] rounded-xl bg-[var(--sa-navy)] text-sm font-semibold text-[var(--sa-text-on-navy)]"
                >
                  نمایش {toFa(resultCount)} نتیجه
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--sa-border)] bg-white px-3 text-sm font-medium text-[var(--sa-navy)] lg:hidden"
      >
        <IconSliders size={15} />
        فیلتر
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--sa-navy)] px-1 text-[10px] text-[var(--sa-text-on-navy)]">
            {toFa(activeCount)}
          </span>
        )}
      </button>
      {sheet}
    </>
  );
}
