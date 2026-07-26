"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FadeSection } from "@/components/FadeSection";
import { IconPlus } from "@/components/Icons";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { faqs as defaultFaqs } from "@/data/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function FaqSection({ items }: { items?: { q: string; a: string }[] }) {
  const faqs = items?.length ? items : defaultFaqs;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <FadeSection
      id="faq"
      tone="navy"
      motif="ornament"
      className="scroll-mt-20 px-4 py-[clamp(2.5rem,5vw,4.5rem)] sm:px-6"
    >
      <div className="mx-auto max-w-3xl">
        <SectionTitle light className="mb-8">
          سوالات متداول
        </SectionTitle>

        <RevealGroup className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <RevealItem key={item.q}>
                <div className="overflow-hidden rounded-[var(--sa-radius-card)] border border-white/15 bg-[var(--sa-cream)] text-[var(--sa-text)]">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-right"
                  >
                    <span className="font-medium">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.22 }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--sa-radius-btn)] bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
                    >
                      <IconPlus size={16} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-[var(--sa-border)] px-4 pb-4 pt-3 text-sm leading-8 text-[var(--sa-text-muted)]">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </FadeSection>
  );
}
