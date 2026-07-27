"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export type SaSelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SaSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Compact for table rows */
  size?: "md" | "sm";
};

const ease = [0.22, 1, 0.36, 1] as const;

/** Animated brand dropdown for admin forms and tables. */
export function SaSelect({
  value,
  onChange,
  options,
  placeholder = "انتخاب کنید",
  disabled,
  className = "",
  size = "md",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);
  const sm = size === "sm";

  useEffect(() => setMounted(true), []);

  function updatePos() {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    function onScroll() {
      updatePos();
    }
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      const menu = document.getElementById(listId);
      if (menu?.contains(t)) return;
      setOpen(false);
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
  }, [open, listId]);

  const menu = (
    <AnimatePresence>
      {open && (
        <motion.ul
          id={listId}
          role="listbox"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.22, ease }}
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            width: Math.max(menuPos.width, sm ? 140 : 180),
            zIndex: 80,
          }}
          className={`max-h-56 overflow-auto rounded-xl border border-[var(--sa-border)] bg-[var(--sa-cream)] p-1 shadow-[0_12px_28px_rgba(22,44,72,0.14)] ${
            sm ? "text-xs" : "text-sm"
          }`}
        >
          {options.map((opt, i) => {
            const active = opt.value === value;
            return (
              <motion.li
                key={opt.value || `empty-${i}`}
                role="option"
                aria-selected={active}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.15), duration: 0.2, ease }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-right transition ${
                    active
                      ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
                      : "text-[var(--sa-navy)] hover:bg-white/80"
                  }`}
                >
                  <span className="min-w-0 truncate">{opt.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sa-gold)]" />
                  )}
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 border bg-white/90 text-right transition outline-none disabled:cursor-not-allowed disabled:opacity-55 ${
          sm
            ? "h-8 rounded-lg px-2.5 text-xs"
            : "h-11 rounded-xl px-3.5 text-sm"
        } ${
          open
            ? "border-[var(--sa-gold)] ring-2 ring-[var(--sa-gold)]/25"
            : "border-[var(--sa-border)] hover:border-[var(--sa-gold)]/70"
        } text-[var(--sa-navy)]`}
      >
        <span className={`min-w-0 truncate ${selected ? "" : "text-[var(--sa-text-muted)]"}`}>
          {selected?.label ?? placeholder}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease }}
          className="shrink-0 text-[var(--sa-navy-muted)]"
        >
          <svg width={sm ? 12 : 14} height={sm ? 12 : 14} viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 6 8 10.5 12.5 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>

      {mounted ? createPortal(menu, document.body) : null}
    </div>
  );
}
