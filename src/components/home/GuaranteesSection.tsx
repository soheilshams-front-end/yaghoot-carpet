"use client";

import { motion } from "framer-motion";
import { FadeSection } from "@/components/FadeSection";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import {
  IconChat,
  IconShield,
  IconTag,
  IconTruck,
} from "@/components/Icons";
import { SectionTitle } from "@/components/SectionTitle";
import { guarantees as defaultGuarantees } from "@/data/site";

const icons = {
  truck: IconTruck,
  chat: IconChat,
  shield: IconShield,
  tag: IconTag,
};

type Guarantee = { title: string; desc: string; icon: string; image: string };

export function GuaranteesSection({ items }: { items?: Guarantee[] }) {
  const guarantees = items?.length ? items : defaultGuarantees;
  return (
    <FadeSection id="guarantees" tone="navy" motif="floral" className="scroll-mt-20 px-4 py-[clamp(2.5rem,5vw,4rem)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionTitle light className="mb-8">
          چرا فرش یاقوت؟
        </SectionTitle>

        <RevealGroup className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {guarantees.map((g) => {
            const Icon = icons[g.icon as keyof typeof icons] ?? IconShield;
            return (
              <RevealItem key={g.title}>
                <motion.article
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/15 shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--sa-navy)] via-[var(--sa-navy)]/75 to-[var(--sa-navy)]/35" />
                  <div
                    className="pointer-events-none absolute inset-2 rounded-[12px] border border-[var(--sa-gold)]/25"
                    aria-hidden
                  />

                  <div className="relative z-10 flex min-h-[200px] flex-col items-center justify-end px-3 pb-5 pt-10 text-center sm:min-h-[230px] sm:px-4">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sa-cream)]/95 text-[var(--sa-navy)] shadow-md ring-1 ring-[var(--sa-gold)]/40">
                      <Icon size={22} />
                    </span>
                    <h3 className="text-sm font-bold text-white sm:text-base">{g.title}</h3>
                    {g.desc ? (
                      <p className="mt-1.5 text-[11px] leading-5 text-white/75 sm:text-xs">
                        {g.desc}
                      </p>
                    ) : null}
                  </div>
                </motion.article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </FadeSection>
  );
}
