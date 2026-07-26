"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconCheck, IconClose } from "@/components/Icons";

export type ToastKind = "success" | "info" | "warn";

type ToastAction = {
  label: string;
  href: string;
};

type ToastItem = {
  id: number;
  title: string;
  message?: string;
  kind: ToastKind;
  action?: ToastAction;
};

type ToastContextValue = {
  notify: (
    title: string,
    message?: string,
    kind?: ToastKind,
    action?: ToastAction,
  ) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let seq = 0;
const ease = [0.22, 1, 0.36, 1] as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (
      title: string,
      message?: string,
      kind: ToastKind = "success",
      action?: ToastAction,
    ) => {
      const id = ++seq;
      setItems((prev) => [...prev.slice(-3), { id, title, message, kind, action }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, action ? 4500 : 3200);
    },
    [],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed z-[100] flex w-[min(18.5rem,calc(100vw-2rem))] flex-col gap-2 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6"
        style={{
          right: "calc(1rem + var(--sa-dash-rail, 0px))",
          transition: "right 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 36, scale: 0.96 }}
              transition={{ duration: 0.35, ease }}
              className="pointer-events-auto overflow-hidden rounded-xl border border-[var(--sa-border)] bg-[var(--sa-bg)]/95 shadow-[0_12px_32px_rgba(30,58,95,0.18)] backdrop-blur-md"
            >
              <div className="flex items-start gap-2.5 px-3 py-2.5">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    t.kind === "warn"
                      ? "bg-amber-400 text-[var(--sa-text)]"
                      : t.kind === "info"
                        ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
                        : "bg-[var(--sa-gold)] text-[var(--sa-text)]"
                  }`}
                >
                  {t.kind === "warn" ? "!" : <IconCheck size={12} />}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[12px] font-semibold leading-4 text-[var(--sa-navy)]">
                    {t.title}
                  </p>
                  {t.message && (
                    <p className="mt-0.5 text-[11px] leading-4 text-[var(--sa-text-muted)]">
                      {t.message}
                    </p>
                  )}
                  {t.action && (
                    <Link
                      href={t.action.href}
                      onClick={() => dismiss(t.id)}
                      className="mt-1.5 inline-flex text-[11px] font-semibold text-[var(--sa-navy)] underline decoration-[var(--sa-gold)] underline-offset-2"
                    >
                      {t.action.label}
                    </Link>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="rounded-md p-0.5 text-[var(--sa-text-muted)] transition hover:bg-[var(--sa-cream)] hover:text-[var(--sa-navy)]"
                  aria-label="بستن"
                >
                  <IconClose size={12} />
                </button>
              </div>
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: t.action ? 4.2 : 3, ease: "linear" }}
                className={`h-[2px] origin-right ${
                  t.kind === "warn"
                    ? "bg-amber-400"
                    : t.kind === "info"
                      ? "bg-[var(--sa-navy)]"
                      : "bg-[var(--sa-gold)]"
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
