"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SaSpinner } from "@/components/loading/SaSpinner";

type LoadingContextValue = {
  busy: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
  setRouteLoading: (on: boolean, message?: string) => void;
  withLoading: <T>(fn: () => Promise<T>, message?: string) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [actionDepth, setActionDepth] = useState(0);
  const [routeOn, setRouteOn] = useState(false);
  const [message, setMessage] = useState("در حال بارگذاری…");

  useEffect(() => {
    setActionDepth(0);
    setRouteOn(false);
  }, [pathname]);

  const show = useCallback((msg = "لطفاً صبر کنید…") => {
    setMessage(msg);
    setActionDepth((d) => d + 1);
  }, []);

  const hide = useCallback(() => {
    setActionDepth((d) => Math.max(0, d - 1));
  }, []);

  const setRouteLoading = useCallback((on: boolean, msg = "در حال بارگذاری صفحه…") => {
    if (on) setMessage(msg);
    setRouteOn(on);
  }, []);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>, msg?: string) => {
      show(msg);
      try {
        return await fn();
      } finally {
        hide();
      }
    },
    [show, hide],
  );

  const busy = actionDepth > 0 || routeOn;

  const value = useMemo(
    () => ({ busy, message, show, hide, setRouteLoading, withLoading }),
    [busy, message, show, hide, setRouteLoading, withLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {busy && (
          <motion.div
            key="sa-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--sa-cream)]/75 backdrop-blur-[4px]"
            aria-busy="true"
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] px-8 py-7 shadow-[0_18px_50px_rgba(30,58,95,0.14)]"
            >
              <SaSpinner size="lg" label={message} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}
