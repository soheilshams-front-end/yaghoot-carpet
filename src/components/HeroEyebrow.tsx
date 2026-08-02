import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Minimal Persian plaque label — unique shape, quiet finish */
export function HeroEyebrow({ children, className = "" }: Props) {
  return (
    <span
      className={`relative inline-flex min-h-[2.4rem] items-center justify-center px-8 py-2 ${className}`}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 280 44"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M22 2 H258 L278 22 L258 42 H22 L2 22 Z"
          fill="var(--sa-navy)"
          stroke="var(--sa-gold)"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
      </svg>
      <span className="relative z-10 text-[13px] font-semibold tracking-[0.14em] text-[var(--sa-text-on-navy)] sm:text-sm">
        {children}
      </span>
    </span>
  );
}
