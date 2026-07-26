"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronLeft, IconChevronRight } from "@/components/Icons";
import type { Rug } from "@/data/rugs";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  rugs: Rug[];
};

/** Dual featured rugs — slide left→in / right→out with faded neighbors */
export function HeroFeaturedCarousel({ rugs }: Props) {
  const items = rugs;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1); // 1 = next (enter left, exit right)
  const n = items.length;

  useEffect(() => {
    if (n < 2) return;
    const id = window.setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % n);
    }, 4500);
    return () => window.clearInterval(id);
  }, [n]);

  if (n === 0) return null;

  const at = (i: number) => items[((i % n) + n) % n];
  const left = at(index - 1);
  const a = at(index);
  const b = at(index + 1);
  const right = at(index + 2);

  function prev() {
    setDir(-1);
    setIndex((i) => (i <= 0 ? n - 1 : i - 1));
  }
  function next() {
    setDir(1);
    setIndex((i) => (i + 1) % n);
  }

  // dir 1: از چپ بیا، از راست برو
  const slide = {
    enter: (d: number) => ({ x: d > 0 ? -72 : 72, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? 72 : -72, opacity: 0 }),
  };

  return (
    <div className="relative">
      <div className="relative mx-auto flex h-[min(58vw,26rem)] max-w-lg items-center justify-center sm:h-[28rem] lg:max-w-none">
        <PeekCard rug={left} side="left" keyId={`l-${left.id}-${index}`} dir={dir} />

        <div className="relative z-20 w-[88%] overflow-hidden sm:w-[90%]">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={`pair-${index}-${a.id}`}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              <FeaturedCard rug={a} />
              <FeaturedCard rug={b} />
            </motion.div>
          </AnimatePresence>
        </div>

        <PeekCard rug={right} side="right" keyId={`r-${right.id}-${index}`} dir={dir} />
      </div>

      {n > 2 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] transition hover:opacity-90"
            aria-label="فرش قبلی"
          >
            <IconChevronRight size={16} />
          </button>
          <span className="min-w-[3.5rem] text-center text-xs text-[var(--sa-text-muted)]">
            {toFa(index + 1)} / {toFa(n)}
          </span>
          <button
            type="button"
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--sa-border)] bg-white text-[var(--sa-navy)] transition hover:border-[var(--sa-gold)]"
            aria-label="فرش بعدی"
          >
            <IconChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function FeaturedCard({ rug }: { rug: Rug }) {
  return (
    <Link
      href={`/rugs/${rug.id}`}
      className="group relative block min-w-0 overflow-hidden rounded-2xl border border-[var(--sa-border)] shadow-lg"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={rug.image}
        alt={rug.title}
        className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--sa-navy)]/85 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3.5 text-[var(--sa-text-on-navy)] sm:p-4">
        <p className="line-clamp-1 text-sm font-semibold sm:text-base">{rug.title}</p>
        <p className="mt-1 text-[11px] text-[var(--sa-gold)] sm:text-xs">مشاهده محصول</p>
      </div>
    </Link>
  );
}

function PeekCard({
  rug,
  side,
  keyId,
  dir,
}: {
  rug: Rug;
  side: "left" | "right";
  keyId: string;
  dir: number;
}) {
  const isLeft = side === "left";
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={keyId}
        initial={{ opacity: 0, x: dir > 0 ? (isLeft ? -20 : -12) : isLeft ? 12 : 20 }}
        animate={{ opacity: 0.35, x: 0, scale: 0.86 }}
        exit={{ opacity: 0, x: dir > 0 ? (isLeft ? 12 : 20) : isLeft ? -20 : -12 }}
        transition={{ duration: 0.55, ease }}
        className={`pointer-events-none absolute top-1/2 z-10 hidden w-[22%] -translate-y-1/2 sm:block ${
          isLeft ? "-left-2 origin-right" : "-right-2 origin-left"
        }`}
        aria-hidden
      >
        <div className="relative overflow-hidden rounded-xl border border-[var(--sa-border)]/50 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={rug.image} alt="" className="aspect-[3/4] w-full object-cover" />
          <div className="absolute inset-0 bg-[var(--sa-cream)]/40" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function toFa(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}
