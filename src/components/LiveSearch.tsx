"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronLeft, IconSearch } from "@/components/Icons";
import { formatPrice } from "@/data/rugs";

export type SearchHit = {
  id: string;
  title: string;
  code: string;
  price: number;
  image: string;
  shaneh: number;
  collection: string;
  stock: number;
};

type Props = {
  /** Desktop compact bar vs mobile full-width panel */
  variant?: "desktop" | "mobile";
  autoFocus?: boolean;
  onNavigate?: () => void;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function LiveSearch({
  variant = "desktop",
  autoFocus,
  onNavigate,
  className = "",
  inputRef: externalRef,
}: Props) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef ?? internalRef;

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(-1);
  const reqSeq = useRef(0);

  const fetchHits = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setItems([]);
      setLoading(false);
      return;
    }
    const seq = ++reqSeq.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as { items: SearchHit[] };
      if (seq !== reqSeq.current) return;
      setItems(data.items);
      setActive(data.items.length ? 0 : -1);
    } catch {
      if (seq !== reqSeq.current) return;
      setItems([]);
    } finally {
      if (seq === reqSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 1) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setOpen(true);
    const t = window.setTimeout(() => void fetchHits(trimmed), 180);
    return () => window.clearTimeout(t);
  }, [q, fetchHits]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (autoFocus) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
  }, [autoFocus, inputRef]);

  function goAll(e?: FormEvent) {
    e?.preventDefault();
    const query = q.trim();
    if (!query) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/rugs?q=${encodeURIComponent(query)}`);
  }

  function goProduct(id: string) {
    setOpen(false);
    setQ("");
    onNavigate?.();
    router.push(`/rugs/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && active >= 0 && items[active]) {
      e.preventDefault();
      goProduct(items[active]!.id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showPanel = open && q.trim().length > 0;
  const isMobile = variant === "mobile";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form
        onSubmit={goAll}
        className={
          isMobile
            ? "flex items-center gap-2 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] px-3 py-2.5 shadow-sm"
            : "flex items-center gap-2 rounded-[var(--sa-radius-btn)] border border-[var(--sa-border)] bg-[var(--sa-bg)]/80 px-3 py-2"
        }
        role="search"
      >
        <IconSearch
          size={18}
          className={`shrink-0 ${loading ? "animate-pulse text-[var(--sa-gold)]" : "text-[var(--sa-navy)]"}`}
        />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (q.trim()) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={isMobile ? "جست‌وجوی فرش…" : "جست و جو کنید"}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showPanel}
          className={
            isMobile
              ? "min-w-0 flex-1 bg-transparent text-sm text-[var(--sa-navy)] outline-none placeholder:text-[var(--sa-text-muted)]"
              : "w-36 bg-transparent text-sm outline-none placeholder:text-[var(--sa-text-muted)] lg:w-48"
          }
        />
        {isMobile ? (
          <button
            type="submit"
            className="shrink-0 rounded-full bg-[var(--sa-gold)] px-3 py-1.5 text-xs font-semibold text-[var(--sa-text)]"
          >
            همه
          </button>
        ) : (
          <button type="submit" aria-label="جستجو در فروشگاه" className="text-[var(--sa-navy)]">
            <IconChevronLeft size={16} />
          </button>
        )}
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.22, ease }}
            className={`absolute z-[90] overflow-hidden rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-cream)] shadow-[0_18px_40px_rgba(30,58,95,0.18)] ${
              isMobile
                ? "inset-x-0 top-[calc(100%+0.45rem)]"
                : "left-0 top-[calc(100%+0.45rem)] w-[min(22rem,calc(100vw-2rem))]"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[var(--sa-border)] bg-[var(--sa-navy)] px-3.5 py-2.5">
              <p className="text-[11px] text-[var(--sa-gold)]">نتایج لحظه‌ای</p>
              {loading ? (
                <span className="text-[10px] text-white/55">در حال جستجو…</span>
              ) : (
                <span className="text-[10px] text-white/55">
                  {items.length
                    ? `${new Intl.NumberFormat("fa-IR").format(items.length)} مورد`
                    : "بدون نتیجه"}
                </span>
              )}
            </div>

            {items.length > 0 ? (
              <ul className="max-h-[min(22rem,55vh)] overflow-y-auto p-1.5">
                {items.map((item, i) => {
                  const selected = i === active;
                  return (
                    <li key={item.id} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => goProduct(item.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-right transition ${
                          selected
                            ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
                            : "text-[var(--sa-navy)] hover:bg-[var(--sa-bg)]"
                        }`}
                      >
                        <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-[var(--sa-navy)]/10 ring-1 ring-[var(--sa-border)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          {item.stock <= 0 && (
                            <span className="absolute inset-x-0 bottom-0 bg-[var(--sa-navy)]/85 py-0.5 text-center text-[8px] text-white">
                              ناموجود
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold leading-5">
                            {item.title}
                          </span>
                          <span
                            className={`mt-0.5 block text-[10px] ${
                              selected ? "text-[var(--sa-gold)]" : "text-[var(--sa-text-muted)]"
                            }`}
                          >
                            کد {item.code} · {item.collection} · {item.shaneh} شانه
                          </span>
                          <span
                            className={`mt-1 block text-xs font-semibold ${
                              selected ? "text-[var(--sa-gold)]" : "text-[var(--sa-navy)]"
                            }`}
                          >
                            {formatPrice(item.price)}
                          </span>
                        </span>
                        <IconChevronLeft
                          size={14}
                          className={selected ? "text-[var(--sa-gold)]" : "opacity-40"}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              !loading && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-[var(--sa-navy)]">چیزی پیدا نشد</p>
                  <p className="mt-1 text-xs text-[var(--sa-text-muted)]">
                    نام، کد یا کالکشن دیگری را امتحان کنید
                  </p>
                </div>
              )
            )}

            <Link
              href={`/rugs?q=${encodeURIComponent(q.trim())}`}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="flex items-center justify-center gap-1.5 border-t border-[var(--sa-border)] bg-white/70 px-3 py-2.5 text-xs font-semibold text-[var(--sa-navy)] hover:bg-white"
            >
              مشاهده همه نتایج در فروشگاه
              <IconChevronLeft size={14} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
