"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FadeSection } from "@/components/FadeSection";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { img } from "@/lib/images";

type ShanehItem = { shaneh: number; image: string; hint?: string; label?: string };

const defaultItems: ShanehItem[] = [
  { shaneh: 1500, image: img.shaneh1500, hint: "تراکم لوکس" },
  { shaneh: 1200, image: img.shaneh1200, hint: "جزئیات ظریف" },
  { shaneh: 1000, image: img.shaneh1000, hint: "تعادل کیفیت" },
  { shaneh: 700, image: img.shaneh700, hint: "اقتصادی روزمره" },
];

export function ShanehSection({ items = defaultItems }: { items?: ShanehItem[] }) {
  return (
    <FadeSection id="shaneh" tone="bone" motif="islimi" className="scroll-mt-20 px-4 py-[clamp(2rem,4vw,3.5rem)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionTitle className="mb-6">تفکیک بر اساس شانه</SectionTitle>
        <RevealGroup className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((item) => (
            <RevealItem key={item.shaneh}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
                <Link
                  href={`/rugs?shaneh=${item.shaneh}`}
                  className="group relative block overflow-hidden rounded-[var(--sa-radius-card)] border border-[var(--sa-border)] bg-[var(--sa-navy)] shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={`${item.shaneh} شانه`}
                    className="aspect-[4/5] w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--sa-navy)] via-[var(--sa-navy)]/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-center text-[var(--sa-text-on-navy)] sm:p-4">
                    <span className="block text-2xl font-bold sm:text-3xl">
                      {new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(item.shaneh)}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--sa-gold)] sm:text-sm">شانه</span>
                    <span className="mt-1 block text-[10px] opacity-80 sm:text-xs">
                      {item.hint || item.label || ""}
                    </span>
                  </div>
                </Link>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </FadeSection>
  );
}
