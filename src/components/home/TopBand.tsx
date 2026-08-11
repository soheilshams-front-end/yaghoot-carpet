"use client";

import { motion } from "framer-motion";
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

const DEFAULT_HEADLINE = "فرش یاقوت نقش مشهد";
const SUBLINE =
  "بافت اصیل، انتخاب دقیق، ارسال مطمئن — مستقیم از کارخانه در آران و بیدگل";

/** Header + full-bleed lifestyle hero, unified with cream brand chrome */
export function TopBand({
  image = defaultHero,
  labels = defaultLabels,
  headline = DEFAULT_HEADLINE,
}: Props) {
  const heroImage =
    !image ||
    image === "/shah-abbasi/hero.jpg" ||
    image.includes("photo-1616486338812")
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
    <div id="hero" className="sa-framed scroll-mt-20">
      <span className="sa-motif sa-motif-tl" aria-hidden />
      <span className="sa-motif sa-motif-tr" aria-hidden />
      <span className="sa-motif sa-motif-bl" aria-hidden />
      <span className="sa-motif sa-motif-br" aria-hidden />

      <div className="sa-framed-inner relative overflow-hidden bg-[var(--sa-cream)]">
        <PatternFill motif="floral" opacity={0.045} size={520} />

        <div className="relative z-20 border-b border-[var(--sa-border)]/80">
          <SiteHeader embedded />
        </div>

        <section className="relative z-10">
          <div className="relative mx-auto max-w-6xl px-3 pt-3 sm:px-5 sm:pt-4">
            <div className="relative min-h-[52vh] overflow-hidden rounded-[2px] ring-1 ring-[var(--sa-gold)]/35 sm:min-h-[62vh]">
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.02 }}
                animate={{ scale: 1.06 }}
                transition={{
                  duration: 22,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt="فرش یاقوت نقش مشهد"
                  className="h-full w-full object-cover object-[center_55%]"
                />
              </motion.div>

              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[var(--sa-navy-deep)]/80 via-[var(--sa-navy-deep)]/25 to-[var(--sa-cream)]/15"
              />

              <div className="relative z-10 flex min-h-[52vh] flex-col justify-end px-5 pb-8 pt-20 sm:min-h-[62vh] sm:px-10 sm:pb-11">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, ease }}
                  className="max-w-2xl"
                >
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--sa-gold)] sm:text-xs">
                    فرش دست‌انتخاب · کاشان و آران و بیدگل
                  </p>
                  <h1 className="font-display mt-3 min-h-[1.5em] text-[2.35rem] leading-[1.55] text-[var(--sa-text-on-navy)] sm:mt-4 sm:text-5xl sm:leading-[1.55] lg:text-[3.35rem]">
                    <Typewriter text={title} speed={75} startDelay={280} />
                  </h1>
                  <p className="mt-4 max-w-lg text-[13px] font-medium leading-7 text-[var(--sa-text-on-navy)]/85 sm:text-[15px] sm:leading-8">
                    {SUBLINE}
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <SaButton
                      href="/rugs"
                      variant="gold"
                      className="!h-11 !px-6 !text-sm sm:!h-auto sm:!px-7 sm:!py-2.5 sm:!text-[15px]"
                    >
                      مشاهده فروشگاه
                    </SaButton>
                    <SaButton
                      href="/about"
                      variant="outline"
                      className="!h-11 !border-[var(--sa-gold)]/45 !bg-transparent !px-5 !text-sm !text-[var(--sa-text-on-navy)] hover:!border-[var(--sa-gold)] sm:!h-auto sm:!px-6 sm:!py-2.5"
                    >
                      درباره برند
                    </SaButton>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-6xl px-3 py-5 sm:px-5 sm:py-6">
            <ul className="hidden divide-x divide-[var(--sa-border)] lg:grid lg:grid-cols-6 lg:divide-x-reverse">
              {trustItems.map((item) => (
                <li
                  key={item.id}
                  className="px-3 text-center text-[12px] font-medium leading-6 tracking-wide text-[var(--sa-navy)] sm:text-[13px]"
                >
                  {item.text}
                </li>
              ))}
            </ul>

            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:hidden">
              {trustItems.map((item) => (
                <li
                  key={item.id}
                  className="border border-[var(--sa-border)]/80 bg-[var(--sa-bg)]/60 px-3 py-2.5 text-center text-[11.5px] font-medium leading-5 text-[var(--sa-navy)]"
                >
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
