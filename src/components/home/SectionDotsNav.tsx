"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";

export type SectionDot = {
  id: string;
  label: string;
};

type Props = {
  sections: SectionDot[];
};

const ease = [0.22, 1, 0.36, 1] as const;
const soft = { duration: 0.55, ease } as const;
const DOTS_PER_GAP = 5;

type MicroDot = { key: string; t: number; top: number };

export function SectionDotsNav({ sections }: Props) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const gapCount = Math.max(0, sections.length - 1);

  const { scrollY } = useScroll();
  const springProgress = useSpring(0, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  const measure = useCallback(() => {
    if (!ids.length) return;

    const anchor = window.innerHeight * 0.32;
    let nextActive = 0;

    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]!);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= anchor) nextActive = i;
    }

    const first = document.getElementById(ids[0]!);
    const last = document.getElementById(ids[ids.length - 1]!);
    let nextProgress = 0;

    if (first && last) {
      const start = first.offsetTop;
      const end = last.offsetTop;
      const span = Math.max(1, end - start);
      const y = window.scrollY + anchor;
      nextProgress = Math.min(1, Math.max(0, (y - start) / span));
    }

    setActive(nextActive);
    springProgress.set(nextProgress);
    setReady(true);
  }, [ids, springProgress]);

  useEffect(() => {
    if (!ids.length) return;

    document.documentElement.classList.add("sa-section-rail");
    measure();

    const unsub = scrollY.on("change", () => {
      measure();
    });

    window.addEventListener("resize", measure, { passive: true });
    return () => {
      document.documentElement.classList.remove("sa-section-rail");
      unsub();
      window.removeEventListener("resize", measure);
    };
  }, [ids, measure, scrollY]);

  useMotionValueEvent(springProgress, "change", (v) => {
    setProgress(v);
  });

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const microDots = useMemo(() => {
    if (gapCount === 0) return [] as MicroDot[];
    const out: MicroDot[] = [];
    for (let g = 0; g < gapCount; g++) {
      const a = g / gapCount;
      const b = (g + 1) / gapCount;
      for (let d = 0; d < DOTS_PER_GAP; d++) {
        const f = (d + 1) / (DOTS_PER_GAP + 1);
        const t = a + (b - a) * f;
        out.push({
          key: `m-${g}-${d}`,
          t,
          top: t * 100,
        });
      }
    }
    return out;
  }, [gapCount]);

  /** At most 2 nearest micro-dots to the playhead are gold */
  const { hotKeys, nearestKey } = useMemo(() => {
    if (!microDots.length) {
      return { hotKeys: new Set<string>(), nearestKey: null as string | null };
    }
    const ranked = [...microDots]
      .map((d) => ({ key: d.key, dist: Math.abs(d.t - progress) }))
      .sort((a, b) => a.dist - b.dist);
    const top2 = ranked.slice(0, 2);
    return {
      hotKeys: new Set(top2.map((r) => r.key)),
      nearestKey: top2[0]?.key ?? null,
    };
  }, [microDots, progress]);

  if (!sections.length) return null;

  return (
    <nav
      aria-label="ناوبری بخش‌های صفحه"
      className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:right-7"
    >
      <motion.div
        initial={{ opacity: 0, x: 14 }}
        animate={{ opacity: ready ? 1 : 0, x: ready ? 0 : 14 }}
        transition={{ duration: 0.85, ease }}
        className="pointer-events-auto relative h-[min(80vh,640px)] w-14"
      >
        {microDots.map((dot) => {
          const hot = hotKeys.has(dot.key);
          const nearest = nearestKey === dot.key;
          const passed = dot.t < progress && !hot;

          return (
            <span
              key={dot.key}
              aria-hidden
              className="absolute left-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ top: `${dot.top}%` }}
            >
              <motion.span
                className="block h-[3.5px] w-[3.5px] rounded-full"
                animate={{
                  y: nearest ? -3.5 : hot ? -2 : 0,
                  scale: nearest ? 2.4 : hot ? 1.9 : passed ? 1.15 : 1,
                  backgroundColor: hot
                    ? "var(--sa-gold)"
                    : passed
                      ? "color-mix(in srgb, var(--sa-navy) 55%, var(--sa-border))"
                      : "color-mix(in srgb, var(--sa-navy) 24%, var(--sa-border))",
                  opacity: hot ? 1 : passed ? 0.7 : 0.4,
                  boxShadow: nearest
                    ? "0 0 10px color-mix(in srgb, var(--sa-gold) 48%, transparent)"
                    : hot
                      ? "0 0 6px color-mix(in srgb, var(--sa-gold) 30%, transparent)"
                      : "0 0 0 transparent",
                }}
                transition={{ duration: 0.55, ease }}
              />
            </span>
          );
        })}

        {sections.map((section, i) => {
          const isActive = i === active;
          const isPassed = i < active;
          const showTip = hovered === section.id || isActive;
          const top = gapCount === 0 ? 0 : (i / gapCount) * 100;

          return (
            <div
              key={section.id}
              className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${top}%` }}
            >
              <div className="relative flex h-12 w-12 items-center justify-center">
                <button
                  type="button"
                  aria-label={section.label}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => goTo(section.id)}
                  onMouseEnter={() => setHovered(section.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(section.id)}
                  onBlur={() => setHovered(null)}
                  className="relative flex h-12 w-12 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--sa-gold)]/45"
                >
                  {isActive && (
                    <motion.span
                      layoutId="sa-section-active"
                      className="absolute h-10 w-10 rounded-full border border-[var(--sa-gold)]/55"
                      transition={{ type: "spring", stiffness: 280, damping: 32, mass: 0.7 }}
                      style={{
                        boxShadow:
                          "0 0 0 3px color-mix(in srgb, var(--sa-gold) 22%, transparent), 0 6px 18px color-mix(in srgb, var(--sa-navy) 18%, transparent)",
                      }}
                    />
                  )}

                  <motion.span
                    aria-hidden
                    className="absolute h-[34px] w-[34px] rounded-full border border-solid"
                    animate={{
                      scale: isActive ? 1.04 : 1,
                      borderColor: isActive
                        ? "color-mix(in srgb, var(--sa-gold) 75%, white)"
                        : isPassed
                          ? "color-mix(in srgb, var(--sa-gold) 40%, var(--sa-navy))"
                          : "color-mix(in srgb, var(--sa-navy) 28%, var(--sa-border))",
                      opacity: isActive ? 1 : 0.9,
                    }}
                    transition={soft}
                  />

                  <motion.span
                    className="absolute h-[26px] w-[26px] rounded-full border-[1.5px] border-solid"
                    animate={{
                      scale: isActive ? 1.06 : 1,
                      background: isActive
                        ? "radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--sa-navy-muted) 50%, white), var(--sa-navy) 58%, var(--sa-navy-deep))"
                        : isPassed
                          ? "radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--sa-gold) 28%, var(--sa-navy)), color-mix(in srgb, var(--sa-navy) 82%, var(--sa-gold)))"
                          : "radial-gradient(circle at 30% 26%, #fffdf8, #f4ece2 68%, #e8dfd2)",
                      borderColor: isActive
                        ? "var(--sa-gold)"
                        : isPassed
                          ? "color-mix(in srgb, var(--sa-gold) 60%, var(--sa-navy))"
                          : "color-mix(in srgb, var(--sa-navy) 45%, var(--sa-border))",
                      boxShadow: isActive
                        ? "inset 0 1px 2px color-mix(in srgb, white 28%, transparent), 0 4px 14px color-mix(in srgb, var(--sa-navy) 22%, transparent)"
                        : isPassed
                          ? "inset 0 1px 1px color-mix(in srgb, white 16%, transparent), 0 2px 8px color-mix(in srgb, var(--sa-navy) 12%, transparent)"
                          : "inset 0 1px 2px color-mix(in srgb, white 65%, transparent), 0 1px 4px color-mix(in srgb, var(--sa-navy) 8%, transparent)",
                    }}
                    transition={soft}
                  />

                  <motion.span
                    aria-hidden
                    className="absolute rounded-full"
                    animate={{
                      width: isActive ? 7 : isPassed ? 5 : 3.5,
                      height: isActive ? 7 : isPassed ? 5 : 3.5,
                      backgroundColor: isActive
                        ? "var(--sa-gold)"
                        : isPassed
                          ? "color-mix(in srgb, var(--sa-gold) 65%, white)"
                          : "color-mix(in srgb, var(--sa-navy) 30%, var(--sa-border))",
                      opacity: isActive ? 1 : isPassed ? 0.85 : 0.45,
                      boxShadow: isActive
                        ? "0 0 7px color-mix(in srgb, var(--sa-gold) 55%, transparent)"
                        : "none",
                    }}
                    transition={soft}
                  />
                </button>

                <AnimatePresence>
                  {showTip && (
                    <motion.span
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.4, ease }}
                      className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[var(--sa-border)] bg-[var(--sa-bg)] px-3 py-1.5 text-xs font-medium text-[var(--sa-navy)] shadow-[0_8px_18px_rgba(30,58,95,0.1)]"
                    >
                      {section.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </motion.div>
    </nav>
  );
}
