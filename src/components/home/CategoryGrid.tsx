"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FadeSection } from "@/components/FadeSection";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";

export function CategoryGrid({
  categories,
}: {
  categories: { id: string; title: string; image: string }[];
}) {
  const list = categories.length
    ? categories
    : [];
  if (!list.length) return null;

  return (
    <FadeSection id="categories" tone="bone" motif="ornament" className="scroll-mt-20 px-4 py-[clamp(2.5rem,5vw,4rem)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionTitle className="mb-8">دسته‌بندی فرش‌های یاقوت</SectionTitle>

        <RevealGroup className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {list.map((c) => (
            <RevealItem key={c.id}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
                <Link href={`/rugs?collection=${c.id}`} className="group block">
                  <div
                    className="relative mx-auto aspect-[3/4] w-[90%] overflow-hidden border-2 border-[var(--sa-navy)] bg-[var(--sa-navy-deep)] shadow-md"
                    style={{ borderRadius: "999px 999px 12px 12px" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.image}
                      alt={c.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--sa-navy)] to-transparent px-2 pb-3 pt-10">
                      <p className="text-center text-sm font-medium text-[var(--sa-text-on-navy)] sm:text-base">
                        {c.title}
                      </p>
                    </div>
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
