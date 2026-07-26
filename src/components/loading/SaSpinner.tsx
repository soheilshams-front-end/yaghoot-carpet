"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/Icons";

export function SaSpinner({
  size = "md",
  label,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const dim = size === "sm" ? 36 : size === "lg" ? 72 : 52;
  const logo = size === "sm" ? 18 : size === "lg" ? 36 : 26;

  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div className="relative" style={{ width: dim, height: dim }}>
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-[var(--sa-border)] border-t-[var(--sa-gold)] border-r-[var(--sa-navy)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
        />
        <motion.span
          className="absolute inset-1.5 flex items-center justify-center text-[var(--sa-navy)]"
          animate={{ scale: [0.92, 1, 0.92], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
        >
          <LogoMark size={logo} />
        </motion.span>
      </div>
      {label && (
        <p className="text-sm font-medium text-[var(--sa-navy)]">{label}</p>
      )}
      <span className="sr-only">{label ?? "در حال بارگذاری"}</span>
    </div>
  );
}
