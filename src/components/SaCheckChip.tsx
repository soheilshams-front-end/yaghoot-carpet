"use client";

import { motion } from "framer-motion";

type Props = {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

/** Soft selectable chip with animated accent — for category picks. */
export function SaCheckChip({ selected, onClick, children, className = "" }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      animate={{
        backgroundColor: selected ? "var(--sa-navy)" : "#ffffff",
        color: selected ? "var(--sa-text-on-navy)" : "var(--sa-navy)",
        borderColor: selected ? "var(--sa-navy)" : "var(--sa-border)",
      }}
      transition={{ duration: 0.25, ease }}
      className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-3.5 py-1.5 text-[12px] font-medium ${className}`}
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] origin-center bg-[var(--sa-gold)]"
        initial={false}
        animate={{ scaleX: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
        transition={{ duration: 0.28, ease }}
      />
      <motion.span
        aria-hidden
        className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full"
        animate={{
          backgroundColor: selected ? "var(--sa-gold)" : "var(--sa-border)",
          scale: selected ? 1.15 : 1,
        }}
        transition={{ duration: 0.22, ease }}
      />
      {children}
    </motion.button>
  );
}
