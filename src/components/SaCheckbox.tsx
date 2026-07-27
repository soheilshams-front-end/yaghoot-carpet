"use client";

import { motion } from "framer-motion";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

/** Compact brand toggle — keeps label + switch on one line. */
export function SaCheckbox({ checked, onChange, label, disabled, className = "" }: Props) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2.5 text-sm text-[var(--sa-navy)] select-none ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className="relative inline-block h-[22px] w-[40px] shrink-0"
      >
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={{
            backgroundColor: checked
              ? "var(--sa-navy)"
              : "color-mix(in srgb, var(--sa-border) 70%, white)",
          }}
          transition={{ duration: 0.28, ease }}
        />
        <motion.span
          className="absolute top-[2px] left-[2px] block h-[18px] w-[18px] rounded-full"
          animate={{
            x: checked ? 18 : 0,
            backgroundColor: checked ? "var(--sa-gold)" : "#ffffff",
          }}
          transition={{ type: "spring", stiffness: 520, damping: 32, mass: 0.55 }}
          style={{
            boxShadow: "0 1px 3px rgba(22, 44, 72, 0.2)",
          }}
        />
      </span>
      <span className="whitespace-nowrap leading-none">{label}</span>
    </label>
  );
}
