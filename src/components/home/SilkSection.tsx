"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeSection } from "@/components/FadeSection";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { RugCard } from "@/components/RugCard";
import { SaButton } from "@/components/SaButton";
import { SectionTitle } from "@/components/SectionTitle";
import { img } from "@/lib/images";
import type { Rug } from "@/data/rugs";

export function SilkSection({ rugs }: { rugs: Rug[] }) {
  const silk = rugs.filter((r) => r.collection === "silk").slice(0, 3);

  return (
    <FadeSection id="silk" tone="bone" motif="scroll" className="scroll-mt-20 px-4 py-[clamp(2.5rem,5vw,4rem)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-end justify-between gap-2 sm:mb-8 sm:gap-4">
          <div className="min-w-0">
            <SectionTitle>مجموعه ابریشم</SectionTitle>
            <Reveal>
              <p className="mt-2 max-w-xl text-xs text-[var(--sa-text-muted)] sm:text-sm">
                لطافت ابریشم و نقوش اصیل — منتخب فرش یاقوت برای فضاهای خاص
              </p>
            </Reveal>
          </div>
          <SaButton href="/rugs?collection=silk" variant="solid">
            مشاهده بیشتر
          </SaButton>
        </div>

        <RevealGroup className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {silk.map((rug) => (
            <RevealItem key={rug.id}>
              <RugCard rug={rug} />
            </RevealItem>
          ))}

          {silk.length < 3 && (
            <RevealItem>
              <motion.aside
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group relative overflow-hidden rounded-2xl border border-[var(--sa-border)] shadow-[0_10px_28px_rgba(30,58,95,0.12)] sm:col-span-2 lg:col-span-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.hero}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--sa-navy)] via-[var(--sa-navy)]/70 to-[var(--sa-navy)]/25" />
                <div
                  className="pointer-events-none absolute inset-2 rounded-[14px] border border-[var(--sa-gold)]/30"
                  aria-hidden
                />
                <div className="relative z-10 flex min-h-[280px] h-full flex-col justify-end p-5 sm:min-h-[320px] sm:p-6 lg:aspect-[4/5] lg:min-h-0">
                  <span className="mb-3 inline-flex w-fit rounded-full bg-[var(--sa-gold)]/90 px-3 py-1 text-[11px] font-medium text-[var(--sa-text)]">
                    کالکشن ویژه
                  </span>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">ابریشم دستباف یاقوت</h3>
                  <p className="mt-2 max-w-sm text-sm leading-7 text-white/80">
                    برای فضاهایی که باید خاص بمانند.
                  </p>
                  <Link
                    href="/rugs?collection=silk"
                    className="mt-5 inline-flex w-fit items-center rounded-full bg-[var(--sa-cream)] px-4 py-2 text-sm font-medium text-[var(--sa-navy)] transition hover:bg-[var(--sa-gold)]"
                  >
                    ورود به مجموعه ابریشم
                  </Link>
                </div>
              </motion.aside>
            </RevealItem>
          )}
        </RevealGroup>
      </div>
    </FadeSection>
  );
}
