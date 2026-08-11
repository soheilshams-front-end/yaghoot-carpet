"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronLeft } from "@/components/Icons";
import { SiteHeader } from "@/components/SiteHeader";
import { heroImage as defaultHero, heroLabels as defaultLabels } from "@/data/site";

const ease = [0.22, 1, 0.36, 1] as const;
const ROTATE_MS = 3800;
const STAGGER = 0.09;

type HeroLabel = {
  id: string;
  text: string;
  side: "left" | "right";
  tone: "navy" | "bone";
};

type Props = {
  image?: string;
  labels?: HeroLabel[];
  eyebrow?: string;
  headline?: string;
};

const DEFAULT_HEADLINE = "فرش یاقوت نقش مشهد";
const SUBLINE = "از کارخانه تا خانه — کاشان و آران و بیدگل";

/** One-line trust strip — rotates on every breakpoint with RTL staggered enter */
function TrustRow({ items }: { items: HeroLabel[] }) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);

  useEffect(() => {
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const mqSm = window.matchMedia("(min-width: 640px)");
    const sync = () => setPerPage(mqLg.matches ? 5 : mqSm.matches ? 3 : 2);
    sync();
    mqLg.addEventListener("change", sync);
    mqSm.addEventListener("change", sync);
    return () => {
      mqLg.removeEventListener("change", sync);
      mqSm.removeEventListener("change", sync);
    };
  }, []);

  const rotating = items.length > perPage;
  const pageCount = rotating ? items.length : 1;

  useEffect(() => {
    setPage(0);
  }, [perPage]);

  useEffect(() => {
    if (!rotating) return;
    const id = window.setInterval(() => {
      setPage((p) => (p + 1) % pageCount);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [rotating, pageCount]);

  // Sliding window: each tick shifts one item (RTL row stays full)
  const current = Array.from(
    { length: Math.min(perPage, items.length) },
    (_, i) => items[(page + i) % items.length]!,
  );

  return (
    <div className="relative min-h-[1.5rem] overflow-hidden sm:min-h-[1.65rem]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={`${perPage}-${page}`}
          className="grid"
          style={{ gridTemplateColumns: `repeat(${current.length}, minmax(0, 1fr))` }}
          aria-live="polite"
          initial="hidden"
          animate="show"
          exit="leave"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: STAGGER, delayChildren: 0.04 },
            },
            leave: {
              transition: { staggerChildren: STAGGER * 0.55, staggerDirection: -1 },
            },
          }}
        >
          {current.map((item, i) => (
            <motion.li
              key={`${item.id}-${page}-${i}`}
              variants={{
                // Enter from the right (RTL start), cascade toward the left
                hidden: { opacity: 0, x: 28 },
                show: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.48, ease },
                },
                leave: {
                  opacity: 0,
                  x: -18,
                  transition: { duration: 0.28, ease },
                },
              }}
              className={`truncate px-2 text-center text-[11px] font-medium leading-5 tracking-wide whitespace-nowrap text-[var(--sa-text-on-navy)]/85 sm:text-[12px] sm:leading-6 lg:px-2.5 lg:text-[13px] ${
                i > 0 ? "border-r border-[var(--sa-text-on-navy)]/20" : ""
              }`}
            >
              {item.text}
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

/** Full-bleed lifestyle photo under translucent header + trust chrome */
export function TopBand({
  image = defaultHero,
  labels = defaultLabels,
  headline = DEFAULT_HEADLINE,
}: Props) {
  const heroImage =
    !image ||
    image === "/shah-abbasi/hero.jpg" ||
    image.includes("photo-1616486338812") ||
    image.includes("photo-1615529328331")
      ? defaultHero
      : image;
  const trustItems = labels.length > 0 ? labels : defaultLabels;
  const title =
    !headline ||
    headline === "به سبک فرش یاقوت" ||
    headline.trim() === "فروشگاه آنلاین"
      ? DEFAULT_HEADLINE
      : headline;

  return (
    <section
      id="hero"
      className="sa-hero-h relative flex scroll-mt-20 flex-col overflow-hidden bg-[var(--sa-navy-deep)]"
    >
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ scale: 1 }}
      >
        <picture>
          {/* 9:16 only on phones — tablet/desktop keep the 21:9 hero */}
          <source media="(max-width: 767px)" srcSet="/shah-abbasi/hero-mobile.webp?v=3" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt="فرش یاقوت نقش مشهد"
            className="h-full w-full object-cover object-[center_72%] md:object-center"
          />
        </picture>
      </motion.div>

      {/* Navy fade under header — same recipe as the category cards */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[30%] bg-gradient-to-b from-[var(--sa-navy)] via-[var(--sa-navy)]/45 to-transparent"
      />
      {/* Navy fade over the copy and trust row */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[58%] bg-gradient-to-t from-[var(--sa-navy)] via-[var(--sa-navy)]/55 to-transparent"
      />

      <motion.div
        initial={{ opacity: 0, y: -28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="relative z-20"
      >
        <SiteHeader embedded suppressEntrance onImage />
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-8 pt-16 sm:px-6 sm:pb-12">
        <div className="max-w-xl">
          <h1 className="font-display text-[2rem] leading-[1.55] sm:text-4xl sm:leading-[1.55] lg:text-[2.75rem]">
            {title.split(/\s+/).map((word, i, arr) => (
              <motion.span
                key={`${word}-${i}`}
                initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  textShadow: [
                    "0 0 16px rgba(255,255,255,0.18), 0 2px 14px rgba(0,0,0,0.4)",
                    "0 0 26px rgba(255,255,255,0.32), 0 2px 14px rgba(0,0,0,0.4)",
                    "0 0 16px rgba(255,255,255,0.18), 0 2px 14px rgba(0,0,0,0.4)",
                  ],
                }}
                transition={{
                  opacity: { duration: 0.7, delay: 0.22 + i * 0.14, ease },
                  y: { duration: 0.7, delay: 0.22 + i * 0.14, ease },
                  filter: { duration: 0.7, delay: 0.22 + i * 0.14, ease },
                  textShadow: {
                    duration: 4.8,
                    delay: 1.2 + i * 0.14,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="inline-block text-white [-webkit-text-stroke:0]"
              >
                {word}
                {i < arr.length - 1 ? "\u00A0" : ""}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.55, ease }}
            className="mt-5 hidden max-w-md lg:block"
          >
            <span
              aria-hidden
              className="mb-3 block h-px w-14 bg-gradient-to-l from-[var(--sa-gold)] to-transparent"
            />
            <p className="text-[13px] font-medium leading-7 tracking-wide text-[var(--sa-cream)]/78 sm:text-[15px] sm:leading-8">
              {SUBLINE}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.72, ease }}
            className="mt-7"
          >
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-flex">
              <Link
                href="/rugs"
                className="group inline-flex h-11 items-center gap-2.5 rounded-2xl border border-[var(--sa-gold)] bg-[var(--sa-gold)] px-6 text-sm font-semibold text-[var(--sa-navy-deep)] shadow-[0_10px_28px_rgba(201,162,39,0.28)] transition-[border-color,box-shadow,background-color,filter] hover:brightness-105 hover:shadow-[0_14px_34px_rgba(201,162,39,0.38)] sm:h-auto sm:px-7 sm:py-2.5 sm:text-[15px]"
              >
                مشاهده فروشگاه
                <IconChevronLeft
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-x-0.5"
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.32, ease }}
        className="relative z-20 shrink-0"
      >
        {/* Extra bottom pad on phones so the trust row clears the fixed MobileTabBar */}
        <div className="mx-auto max-w-6xl px-3 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-2 sm:px-6 md:pb-7">
          <TrustRow items={trustItems} />
        </div>
      </motion.div>
    </section>
  );
}
