"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatPrice, type Rug } from "@/data/rugs";
import { revealViewport } from "@/components/Reveal";

export function RugCard({ rug }: { rug: Rug }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-xl border border-[var(--sa-border)] bg-[var(--sa-bg)] shadow-[0_8px_22px_rgba(30,58,95,0.08)] sm:rounded-2xl"
    >
      <Link href={`/rugs/${rug.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden sm:aspect-[4/5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rug.image}
            alt={rug.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--sa-navy)]/80 via-[var(--sa-navy)]/10 to-transparent" />

          <div className="absolute right-2 top-2 flex flex-col items-end gap-1 sm:right-3 sm:top-3">
            <span className="rounded-full bg-[var(--sa-cream)]/95 px-2 py-0.5 text-[9px] font-medium text-[var(--sa-navy)] shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-xs">
              {rug.shaneh} شانه
            </span>
            {rug.stock <= 0 && (
              <span className="rounded-full bg-[var(--sa-navy)]/90 px-2 py-0.5 text-[9px] font-medium text-[var(--sa-text-on-navy)] shadow-sm sm:px-2.5 sm:py-1 sm:text-xs">
                ناموجود
              </span>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4">
            <p className="text-[10px] text-[var(--sa-gold)] sm:text-xs">کد {rug.code}</p>
            <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-5 text-white sm:mt-1 sm:line-clamp-none sm:text-base sm:leading-6">
              {rug.title}
            </h3>
            <div className="mt-2 flex items-center justify-between gap-1.5 sm:mt-3 sm:gap-2">
              <p className="truncate text-[11px] font-semibold text-[var(--sa-gold)] sm:text-[15px]">
                {formatPrice(rug.price)}
              </p>
              <span className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[10px] text-white ring-1 ring-white/25 transition group-hover:bg-[var(--sa-gold)] group-hover:text-[var(--sa-text)] group-hover:ring-[var(--sa-gold)] sm:px-3 sm:py-1.5 sm:text-xs">
                مشاهده
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div
        className="pointer-events-none absolute inset-1.5 rounded-[10px] border border-[var(--sa-gold)]/25 opacity-0 transition group-hover:opacity-100 sm:inset-2 sm:rounded-[14px]"
        aria-hidden
      />
    </motion.article>
  );
}
