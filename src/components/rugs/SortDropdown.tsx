"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconCheck,
  IconChevronDown,
  IconSortAsc,
  IconSortDesc,
  IconSparkles,
} from "@/components/Icons";

export type SortKey = "newest" | "price-asc" | "price-desc";

const OPTIONS: {
  value: SortKey;
  label: string;
  hint: string;
  Icon: typeof IconSparkles;
}[] = [
  { value: "newest", label: "جدیدترین", hint: "تازه‌ترین طرح‌ها", Icon: IconSparkles },
  { value: "price-asc", label: "ارزان‌ترین", hint: "از کم به زیاد", Icon: IconSortAsc },
  { value: "price-desc", label: "گران‌ترین", hint: "از زیاد به کم", Icon: IconSortDesc },
];

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  value: SortKey;
  onChange: (value: SortKey) => void;
};

/** Compact luxury sort dropdown — matches toolbar chip height */
export function SortDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];
  const CurrentIcon = current.Icon;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative z-40 flex shrink-0 items-center gap-2">
      <span className="hidden text-xs text-[var(--sa-text-muted)] sm:inline">مرتب‌سازی</span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex h-8 min-w-[8.5rem] items-center justify-between gap-2 rounded-full border px-2.5 text-[11px] font-medium transition sm:h-9 sm:min-w-[9.5rem] sm:px-3 sm:text-sm ${
            open
              ? "border-[var(--sa-gold)] bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] shadow-md"
              : "border-[var(--sa-border)] bg-white text-[var(--sa-navy)] hover:border-[var(--sa-navy)]/35"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <CurrentIcon size={15} />
            {current.label}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25, ease }}
            className={`flex h-5 w-5 items-center justify-center rounded-full ${
              open ? "bg-[var(--sa-gold)] text-[var(--sa-text)]" : "bg-[var(--sa-cream)]"
            }`}
            aria-hidden
          >
            <IconChevronDown size={14} />
          </motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              role="listbox"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.28, ease }}
              className="absolute left-0 top-[calc(100%+0.4rem)] w-[13.5rem] overflow-hidden rounded-xl border border-[var(--sa-border)] bg-[var(--sa-cream)] shadow-[0_14px_32px_rgba(30,58,95,0.2)]"
            >
              <div className="border-b border-[var(--sa-border)] bg-[var(--sa-navy)] px-3 py-2">
                <p className="text-[10px] text-[var(--sa-gold)]">ترتیب نمایش</p>
              </div>

              <ul className="p-1.5">
                {OPTIONS.map((opt, i) => {
                  const active = opt.value === value;
                  const Icon = opt.Icon;
                  return (
                    <motion.li
                      key={opt.value}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 + i * 0.04, duration: 0.22, ease }}
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onChange(opt.value);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-right transition ${
                          active
                            ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
                            : "text-[var(--sa-navy)] hover:bg-[var(--sa-bg)]"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            active
                              ? "bg-[var(--sa-gold)] text-[var(--sa-text)]"
                              : "bg-[var(--sa-bg)] text-[var(--sa-navy)]"
                          }`}
                        >
                          <Icon size={14} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold sm:text-[13px]">{opt.label}</span>
                          <span
                            className={`block text-[10px] ${
                              active ? "text-[var(--sa-gold)]" : "text-[var(--sa-text-muted)]"
                            }`}
                          >
                            {opt.hint}
                          </span>
                        </span>
                        {active && <IconCheck size={14} className="text-[var(--sa-gold)]" />}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
