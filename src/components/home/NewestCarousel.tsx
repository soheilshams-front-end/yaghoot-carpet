"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FadeSection } from "@/components/FadeSection";
import { IconChevronLeft, IconChevronRight } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { RugCard } from "@/components/RugCard";
import { SaButton } from "@/components/SaButton";
import { SectionTitle } from "@/components/SectionTitle";
import type { Rug } from "@/data/rugs";

const ease = [0.22, 1, 0.36, 1] as const;

export function NewestCarousel({ rugs }: { rugs: Rug[] }) {
  const items = rugs;
  const [page, setPage] = useState(0);
  const perPage = 4;
  const maxPage = Math.max(0, Math.ceil(items.length / perPage) - 1);
  const slice = items.slice(page * perPage, page * perPage + perPage);

  return (
    <FadeSection id="newest" tone="navy" motif="floral" className="scroll-mt-20 px-4 py-[clamp(2.5rem,5vw,4rem)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-2 sm:mb-8 sm:gap-4">
          <SectionTitle light>جدیدترین فرش‌های ما</SectionTitle>
          <SaButton href="/rugs" variant="outline">
            مشاهده بیشتر
          </SaButton>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease }}
            className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {slice.map((rug, i) => (
              <motion.div
                key={rug.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.07, ease }}
              >
                <RugCard rug={rug} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <Reveal delay={0.1}>
          <div className="mt-8 flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => (p <= 0 ? maxPage : p - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-btn)] bg-[var(--sa-cream)] text-[var(--sa-navy)]"
              aria-label="قبلی"
            >
              <IconChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => (p >= maxPage ? 0 : p + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-btn)] border border-white/25 bg-[var(--sa-navy-deep)] text-[var(--sa-text-on-navy)]"
              aria-label="بعدی"
            >
              <IconChevronLeft size={18} />
            </button>
          </div>
        </Reveal>
      </div>
    </FadeSection>
  );
}
