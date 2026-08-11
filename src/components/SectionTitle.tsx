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
      className={`flex min-w-0 items-center gap-2 text-xl sm:gap-3 sm:text-2xl lg:text-[2rem] ${
        light ? "text-[var(--sa-text-on-navy)]" : "text-[var(--sa-navy)]"
      } ${className}`}
    >
      {bar && (
        <span
          className="mb-[0.2em] h-[0.85em] w-0.5 shrink-0 self-center bg-[var(--sa-gold)]"
          aria-hidden
        />
      )}
      <Typewriter
        text={children}
        whenInView
        speed={38}
        startDelay={120}
        className="font-display min-h-[1.3em] leading-[1.4]"
      />
    </h2>
  );
}
