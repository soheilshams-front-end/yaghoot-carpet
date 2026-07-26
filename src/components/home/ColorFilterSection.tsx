"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { PatternFill } from "@/components/PatternFill";
import { Reveal } from "@/components/Reveal";
import { SaButton } from "@/components/SaButton";
import { Typewriter } from "@/components/Typewriter";
import { colorFilters as defaultColors } from "@/data/site";

const ease = [0.22, 1, 0.36, 1] as const;

type ColorItem = { id: string; label: string; hex: string; image: string };

/** Hero-like color explorer — framed navy band to break the cream streak */
export function ColorFilterSection({ items }: { items?: ColorItem[] }) {
  const colorFilters = items?.length ? items : defaultColors;
  const [active, setActive] = useState(colorFilters[0]!.id);
  const current = colorFilters.find((c) => c.id === active) ?? colorFilters[0];
  const half = Math.ceil(colorFilters.length / 2);
  const rightColors = colorFilters.slice(0, half);
  const leftColors = colorFilters.slice(half);

  return (
    <div id="colors" className="sa-framed sa-framed-round scroll-mt-20">
      <span className="sa-motif sa-motif-tl" aria-hidden />
      <span className="sa-motif sa-motif-tr" aria-hidden />
      <span className="sa-motif sa-motif-bl" aria-hidden />
      <span className="sa-motif sa-motif-br" aria-hidden />

      <div className="sa-framed-inner relative overflow-hidden">
        <PatternFill motif="floral" opacity={0.028} size={500} />

        <section className="relative z-10 px-4 py-[clamp(2.75rem,5.5vw,5rem)] sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <Reveal>
                <span className="inline-block rounded-full bg-[var(--sa-navy)] px-6 py-2 text-base text-[var(--sa-text-on-navy)]">
                  انتخاب رنگ دلخواه
                </span>
              </Reveal>
              <h2 className="mt-4 min-h-[1.4em] text-3xl font-bold text-[var(--sa-navy)] sm:text-4xl lg:text-[2.6rem]">
                <Typewriter
                  text="تفکیک بر اساس رنگ"
                  whenInView
                  speed={38}
                  startDelay={120}
                />
              </h2>
              <Reveal delay={0.15}>
                <p className="mx-auto mt-3 max-w-lg text-base text-[var(--sa-text-muted)]">
                  رنگ مورد علاقه‌تان را لمس کنید و فرش مناسب فضا را ببینید
                </p>
              </Reveal>
            </div>

            <div className="grid items-center gap-5 lg:grid-cols-[1fr_minmax(280px,420px)_1fr] lg:gap-6">
              <div className="hidden flex-col items-end gap-3.5 lg:flex">
                {rightColors.map((c, i) => (
                  <ColorChip
                    key={c.id}
                    label={c.label}
                    hex={c.hex}
                    selected={c.id === active}
                    side="right"
                    delay={0.12 + i * 0.05}
                    onSelect={() => setActive(c.id)}
                  />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease }}
                className="flex flex-col items-center"
              >
                <div className="relative mx-auto mb-2 h-[300px] w-[240px] shrink-0 overflow-hidden rounded-t-[120px] rounded-b-md shadow-2xl ring-2 ring-[var(--sa-gold)]/35 sm:h-[360px] sm:w-[280px] sm:rounded-t-[140px]">
                  <AnimatePresence mode="wait">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <motion.img
                      key={active}
                      src={current.image}
                      alt={current.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AnimatePresence>
                </div>

                <div className="mt-1 text-center">
                  <p className="text-xl font-bold text-[var(--sa-navy)] sm:text-2xl">
                    {current.label}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <SaButton href="/rugs" variant="solid" className="px-6 py-2.5 text-base">
                      مشاهده این رنگ
                    </SaButton>
                  </div>
                </div>
              </motion.div>

              <div className="hidden flex-col items-start gap-3.5 lg:flex">
                {leftColors.map((c, i) => (
                  <ColorChip
                    key={c.id}
                    label={c.label}
                    hex={c.hex}
                    selected={c.id === active}
                    side="left"
                    delay={0.16 + i * 0.05}
                    onSelect={() => setActive(c.id)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-10 flex gap-2.5 overflow-x-auto pb-2 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {colorFilters.map((c) => {
                const selected = c.id === active;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActive(c.id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm whitespace-nowrap transition ${
                      selected
                        ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] ring-2 ring-[var(--sa-gold)]"
                        : "bg-[var(--sa-bg)] text-[var(--sa-text)] ring-1 ring-[var(--sa-border)]"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full ring-1 ring-black/10"
                      style={{ background: c.hex }}
                    />
                    {c.label.replace("فرش ", "")}
                  </button>
                );
              })}
            </div>

            <p className="mt-7 text-center text-base">
              <Link
                href="/rugs"
                className="font-medium text-[var(--sa-navy)] underline-offset-4 hover:underline"
              >
                مشاهده همه فرش‌ها در فروشگاه
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function ColorChip({
  label,
  hex,
  selected,
  side,
  delay,
  onSelect,
}: {
  label: string;
  hex: string;
  selected: boolean;
  side: "left" | "right";
  delay: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: side === "right" ? 28 : -28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative flex w-full max-w-[16.5rem] items-center gap-3 rounded-full px-5 py-3 text-right text-sm shadow-sm sm:max-w-[18rem] sm:text-[15px] ${
        selected
          ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] ring-2 ring-[var(--sa-gold)]"
          : "bg-[var(--sa-bg)] text-[var(--sa-text)] ring-1 ring-[var(--sa-border)]"
      }`}
    >
      <span
        className={`h-5 w-5 shrink-0 rounded-full ring-1 ${
          selected ? "ring-white/40" : "ring-black/15"
        }`}
        style={{ background: hex }}
        aria-hidden
      />
      <span className="leading-6 font-medium">{label}</span>
      <span
        className={`absolute top-1/2 h-px w-9 bg-[var(--sa-navy)]/25 sm:w-11 ${
          side === "right" ? "-left-9 sm:-left-11" : "-right-9 sm:-right-11"
        }`}
        aria-hidden
      />
      <span
        className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ${
          selected ? "bg-[var(--sa-gold)]" : "bg-[var(--sa-navy)]/35"
        } ${side === "right" ? "-left-10 sm:-left-12" : "-right-10 sm:-right-12"}`}
        aria-hidden
      />
    </motion.button>
  );
}
