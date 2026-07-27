"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger = delete, warn = leave unsaved, default = navy */
  tone?: "danger" | "warn" | "default";
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

const ease = [0.22, 1, 0.36, 1] as const;

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return async (options) =>
      typeof window !== "undefined"
        ? window.confirm([options.title, options.description].filter(Boolean).join("\n"))
        : false;
  }
  return ctx;
}

type Pending = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!pending) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        pending.resolve(false);
        setPending(null);
      }
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [pending]);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  function close(result: boolean) {
    pending?.resolve(result);
    setPending(null);
  }

  const value = useMemo(() => confirm, [confirm]);
  const tone = pending?.tone ?? "danger";

  const confirmBtn =
    tone === "danger"
      ? "bg-red-700 text-white hover:bg-red-800"
      : tone === "warn"
        ? "bg-[var(--sa-gold)] text-[var(--sa-text)] hover:brightness-95"
        : "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]";

  const accent =
    tone === "danger"
      ? "bg-red-700/15 text-red-800"
      : tone === "warn"
        ? "bg-[var(--sa-gold)]/20 text-[var(--sa-navy)]"
        : "bg-[var(--sa-navy)]/10 text-[var(--sa-navy)]";

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {pending && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <motion.button
                  type="button"
                  aria-label="بستن"
                  className="absolute inset-0 bg-[var(--sa-navy-deep)]/45 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => close(false)}
                />

                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sa-confirm-title"
                  initial={{ opacity: 0, y: 18, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.32, ease }}
                  className="relative z-10 w-full max-w-sm overflow-hidden rounded-[22px] border border-[var(--sa-border)] bg-[var(--sa-cream)] shadow-[0_24px_60px_rgba(22,44,72,0.28)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: "url(/shah-abbasi/floral-watermark.svg)",
                      backgroundSize: "280px",
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px] bg-[var(--sa-gold)]"
                  />

                  <div className="relative px-6 pb-5 pt-6">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05, type: "spring", stiffness: 380, damping: 22 }}
                      className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}
                    >
                      {tone === "danger" ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path
                            d="M5 7h14M10 7V5h4v2M8 7l1 12h6l1-12"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path
                            d="M12 8v5M12 16.5h.01M12 3.5 2.8 19.5h18.4L12 3.5Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </motion.div>

                    <h2
                      id="sa-confirm-title"
                      className="text-lg font-bold leading-snug text-[var(--sa-navy)]"
                    >
                      {pending.title}
                    </h2>
                    {pending.description && (
                      <p className="mt-2 text-sm leading-7 text-[var(--sa-text-muted)]">
                        {pending.description}
                      </p>
                    )}

                    <div className="mt-6 flex gap-2">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => close(false)}
                        className="flex h-11 flex-1 items-center justify-center rounded-xl border border-[var(--sa-border)] bg-white text-sm font-medium text-[var(--sa-navy)]"
                      >
                        {pending.cancelLabel ?? "انصراف"}
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => close(true)}
                        className={`flex h-11 flex-1 items-center justify-center rounded-xl text-sm font-semibold transition ${confirmBtn}`}
                      >
                        {pending.confirmLabel ?? "تأیید"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
}
