"use client";

import { motion } from "framer-motion";
import { ArchBackdrop } from "@/components/ArchBackdrop";
import { HeroEyebrow } from "@/components/HeroEyebrow";
import { PatternFill } from "@/components/PatternFill";
import { SiteHeader } from "@/components/SiteHeader";
import { Typewriter } from "@/components/Typewriter";
import { heroImage as defaultHero, heroLabels as defaultLabels } from "@/data/site";

const ease = [0.22, 1, 0.36, 1] as const;

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

function LabelPill({
  text,
  tone,
  delay,
  side,
}: {
  text: string;
  tone: "navy" | "bone";
  delay: number;
  side: "left" | "right";
}) {
  const navy = tone === "navy";
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "right" ? 36 : -36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay, ease }}
      whileHover={{ y: -3 }}
      className={`relative max-w-[12.5rem] rounded-full px-3.5 py-2 text-center text-[11px] leading-5 shadow-sm sm:max-w-[14rem] sm:text-xs ${
        navy
          ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
          : "bg-[var(--sa-bg)] text-[var(--sa-text)] ring-1 ring-[var(--sa-border)]"
      }`}
    >
      {text}
      <span
        className={`absolute top-1/2 h-px w-8 bg-[var(--sa-navy)]/30 sm:w-10 ${
          side === "right" ? "-left-8 sm:-left-10" : "-right-8 sm:-right-10"
        }`}
        aria-hidden
      />
      <span
        className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--sa-gold)] ${
          side === "right" ? "-left-9 sm:-left-11" : "-right-9 sm:-right-11"
        }`}
        aria-hidden
      />
    </motion.div>
  );
}

/** Header + Hero as one traditional band (like shahabbasi-carpet.com) */
export function TopBand({
  image = defaultHero,
  labels = defaultLabels,
  eyebrow = "تجربه‌ای متفاوت",
  headline = "به سبک فرش یاقوت",
}: Props) {
  const heroLabels = labels;
  const heroImage = image;
  const right = heroLabels.filter((l) => l.side === "right");
  const left = heroLabels.filter((l) => l.side === "left");

  return (
    <div id="hero" className="sa-framed scroll-mt-20">
      <span className="sa-motif sa-motif-tl" aria-hidden />
      <span className="sa-motif sa-motif-tr" aria-hidden />
      <span className="sa-motif sa-motif-bl" aria-hidden />
      <span className="sa-motif sa-motif-br" aria-hidden />

      <div className="sa-framed-inner sa-top">
        {/* Real Shah Abbasi carpet florals — very faint watermark */}
        <PatternFill motif="floral" opacity={0.055} size={500} />
        <SiteHeader embedded />

        <section className="relative z-10 px-4 pb-12 pt-4 sm:px-6 sm:pb-14">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="mb-6 text-center"
            >
              <HeroEyebrow>{eyebrow}</HeroEyebrow>
              <h1 className="font-display mt-5 min-h-[1.55em] text-[2.65rem] leading-[1.55] text-[var(--sa-navy)] sm:text-5xl sm:leading-[1.6] lg:text-[3.75rem]">
                <Typewriter text={headline} speed={90} startDelay={400} />
              </h1>
            </motion.div>

            <div className="grid items-center gap-2 lg:grid-cols-[1fr_minmax(280px,460px)_1fr]">
              <div className="hidden flex-col items-end gap-5 lg:flex">
                {right.map((l, i) => (
                  <LabelPill
                    key={l.id}
                    text={l.text}
                    tone={l.tone}
                    side="right"
                    delay={0.3 + i * 0.12}
                  />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.15, ease }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <ArchBackdrop className="min-h-[380px] sm:min-h-[460px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroImage}
                      alt="فرش یاقوت"
                      className="mb-8 max-h-[340px] w-[min(280px,70vw)] rounded-t-[140px] rounded-b-md object-cover shadow-2xl ring-2 ring-[var(--sa-gold)]/30 sm:max-h-[420px] sm:w-[320px]"
                    />
                  </ArchBackdrop>
                </motion.div>
              </motion.div>

              <div className="hidden flex-col items-start gap-5 lg:flex">
                {left.map((l, i) => (
                  <LabelPill
                    key={l.id}
                    text={l.text}
                    tone={l.tone}
                    side="left"
                    delay={0.35 + i * 0.12}
                  />
                ))}
              </div>
            </div>

            <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:hidden">
              {heroLabels.map((l) => (
                <li
                  key={l.id}
                  className={`rounded-full px-3 py-1.5 text-[11px] ${
                    l.tone === "navy"
                      ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
                      : "bg-[var(--sa-bg)] text-[var(--sa-text)] ring-1 ring-[var(--sa-border)]"
                  }`}
                >
                  {l.text}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
