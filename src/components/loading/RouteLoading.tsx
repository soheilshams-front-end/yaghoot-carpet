"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLoading } from "@/components/loading/LoadingProvider";

/**
 * Shows global loading from the moment a navigation starts
 * until the destination page has actually rendered — useful on slow networks.
 */
export function RouteLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setRouteLoading } = useLoading();
  const [bar, setBar] = useState(false);
  const [progress, setProgress] = useState(0);

  const key = `${pathname}?${searchParams?.toString() ?? ""}`;
  const prevKey = useRef(key);
  const navigating = useRef(false);
  const startedAt = useRef(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (tick.current) clearInterval(tick.current);
    if (safety.current) clearTimeout(safety.current);
    tick.current = null;
    safety.current = null;
  }

  function start(message = "در حال بارگذاری صفحه…") {
    clearTimers();
    navigating.current = true;
    startedAt.current = Date.now();
    setRouteLoading(true, message);
    setBar(true);
    setProgress(8);
    tick.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.max(0.8, (92 - p) * 0.06)));
    }, 200);
    // Safety: never stick forever
    safety.current = setTimeout(() => finish(), 45_000);
  }

  function finish() {
    if (!navigating.current && !bar) return;
    clearTimers();
    const elapsed = Date.now() - startedAt.current;
    const wait = Math.max(0, 280 - elapsed);

    const end = () => {
      setProgress(100);
      setTimeout(() => {
        setRouteLoading(false);
        setBar(false);
        setProgress(0);
        navigating.current = false;
      }, 220);
    };

    if (wait > 0) setTimeout(end, wait);
    else end();
  }

  // First visit / hard refresh: wait until document is ready
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.readyState === "complete") return;

    start("در حال آماده‌سازی سایت…");
    const onReady = () => finish();
    window.addEventListener("load", onReady);
    return () => window.removeEventListener("load", onReady);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Internal link / back-forward navigation
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const el = (e.target as HTMLElement | null)?.closest?.("a");
      if (!el) return;
      const href = el.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }
      if (el.target === "_blank" || el.hasAttribute("download")) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        const next = `${url.pathname}${url.search}`;
        const cur = `${window.location.pathname}${window.location.search}`;
        if (next === cur) return;
        start("در حال بارگذاری صفحه…");
      } catch {
        /* ignore */
      }
    };

    const onPop = () => start("در حال بارگذاری صفحه…");

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route committed → wait for paint, then hide
  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;
    if (!navigating.current) return;

    let cancelled = false;
    const run = async () => {
      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      );

      const nav = typeof navigator !== "undefined" ? navigator : null;
      const conn = nav
        ? (nav as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
            .connection
        : undefined;
      const slow =
        !!conn &&
        (conn.saveData ||
          conn.effectiveType === "2g" ||
          conn.effectiveType === "slow-2g" ||
          conn.effectiveType === "3g");

      // Keep overlay while chunks hydrate — longer on weak networks
      await new Promise((r) => setTimeout(r, slow ? 700 : 220));
      if (typeof document !== "undefined" && "fonts" in document) {
        try {
          await Promise.race([
            document.fonts.ready,
            new Promise((r) => setTimeout(r, 800)),
          ]);
        } catch {
          /* ignore */
        }
      }
      if (!cancelled) finish();
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => () => clearTimers(), []);

  return (
    <AnimatePresence>
      {bar && (
        <motion.div
          key="nav-progress"
          className="pointer-events-none fixed inset-x-0 top-0 z-[210] h-[3px] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-full origin-right rounded-l-full bg-gradient-to-l from-[var(--sa-gold)] via-[var(--sa-navy)] to-[var(--sa-gold)]"
            style={{ width: `${progress}%` }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
