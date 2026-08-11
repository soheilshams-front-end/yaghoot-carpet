"use client";

import { motion } from "framer-motion";
import { HeroEyebrow } from "@/components/HeroEyebrow";
import { PatternFill } from "@/components/PatternFill";
import { SaButton } from "@/components/SaButton";
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

const SUBLINE = "قیمت درب کارخانه از آران و بیدگل";

/** Header + full-bleed lifestyle hero (luxury rug brand pattern) */
export function TopBand({
  image = defaultHero,
  labels = defaultLabels,
  eyebrow = "تجربه‌ای متفاوت",
  headline = "به سبک فرش یاقوت",
}: Props) {
  const heroImage =
    !image || image === "/shah-abbasi/hero.jpg" ? defaultHero : image;
  const trustItems = labels.length > 0 ? labels : defaultLabels;

  return (
    <div id="hero" className="scroll-mt-20">
      <div className="relative border-b border-[var(--sa-border)] bg-[var(--sa-cream)]">
        <PatternFill motif="floral" opacity={0.04} size={520} />
        <div className="relative z-10">
          <SiteHeader embedded />
        </div>
      </div>

      <section className="relative isolate min-h-[70vh] overflow-hidden bg-[var(--sa-navy-deep)] sm:min-h-[78vh]">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1 }}
          animate={{ scale: 1.04 }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt="فرش یاقوت نقش مشهد"
            className="h-full w-full object-cover object-[center_70%]"
          />
        </motion.div>

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[var(--sa-navy-deep)]/88 via-[var(--sa-navy-deep)]/45 to-[var(--sa-navy-deep)]/25"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[var(--sa-navy-deep)]/35"
        />

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-16 sm:min-h-[78vh] sm:px-6 sm:pb-16 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="max-w-xl text-right"
          >
            <HeroEyebrow>{eyebrow}</HeroEyebrow>
            <h1 className="font-display mt-5 min-h-[1.55em] text-[2.45rem] leading-[1.55] text-[var(--sa-text-on-navy)] sm:text-5xl sm:leading-[1.6] lg:text-[3.5rem]">
              <Typewriter text={headline} speed={90} startDelay={350} />
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--sa-text-on-navy)]/80 sm:text-base sm:leading-8">
              {SUBLINE}
            </p>
            <div className="mt-7">
              <SaButton
                href="/rugs"
                variant="gold"
                className="!h-11 !px-6 !text-sm sm:!h-auto sm:!px-7 sm:!py-2.5 sm:!text-[15px]"
              >
                مشاهده فروشگاه
              </SaButton>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative border-b border-[var(--sa-border)] bg-[var(--sa-cream)]">
        <PatternFill motif="floral" opacity={0.035} size={480} />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
          <ul className="hidden grid-cols-6 gap-0 lg:grid">
            {trustItems.map((item, i) => (
              <li
                key={item.id}
                className={`px-3 text-center text-[12px] leading-6 text-[var(--sa-navy)] sm:text-[13px] ${
                  i > 0 ? "border-r border-[var(--sa-border)]" : ""
                }`}
              >
                {item.text}
              </li>
            ))}
          </ul>

          <ul className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3 lg:hidden">
            {trustItems.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-[var(--sa-border)]/70 bg-[var(--sa-bg)]/50 px-3 py-2.5 text-center text-[11.5px] leading-5 text-[var(--sa-navy)]"
              >
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
