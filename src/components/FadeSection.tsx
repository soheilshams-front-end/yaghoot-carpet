"use client";

import { motion } from "framer-motion";
import { PatternFill, type PatternMotif } from "@/components/PatternFill";
import { revealViewport } from "@/components/Reveal";

type Props = {
  children: React.ReactNode;
  className?: string;
  tone?: "navy" | "bone";
  id?: string;
  motif?: PatternMotif;
};

export function FadeSection({
  children,
  className = "",
  tone = "bone",
  id,
  motif = "floral",
}: Props) {
  const isNavy = tone === "navy";

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden ${
        isNavy ? "sa-section-navy" : "sa-section"
      } ${className}`}
    >
      <PatternFill
        motif={motif}
        opacity={isNavy ? 0.08 : 0.05}
        invert={isNavy}
      />
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}
