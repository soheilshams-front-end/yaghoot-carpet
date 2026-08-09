"use client";

import { Typewriter } from "@/components/Typewriter";

type Props = {
  children: string;
  className?: string;
  /** light text on navy sections */
  light?: boolean;
  bar?: boolean;
};

/** Section heading with fast typewriter on scroll into view */
export function SectionTitle({
  children,
  className = "",
  light = false,
  bar = true,
}: Props) {
  return (
    <h2
      className={`font-display flex min-w-0 items-center gap-2 text-xl leading-[1.7] sm:gap-3 sm:text-2xl lg:text-[2rem] ${
        light ? "text-[var(--sa-text-on-navy)]" : "text-[var(--sa-navy)]"
      } ${className}`}
    >
      {bar && (
        <span
          className="h-4 w-0.5 shrink-0 bg-[var(--sa-gold)] sm:h-6"
          aria-hidden
        />
      )}
      <Typewriter
        text={children}
        whenInView
        speed={38}
        startDelay={120}
        className="min-h-[1.55em]"
      />
    </h2>
  );
}
