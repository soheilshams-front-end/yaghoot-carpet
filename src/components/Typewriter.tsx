"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  /** ms per character */
  speed?: number;
  startDelay?: number;
  /** Start typing only when scrolled into view (once) */
  whenInView?: boolean;
  showCursor?: boolean;
};

export function Typewriter({
  text,
  className = "",
  speed = 85,
  startDelay = 350,
  whenInView = false,
  showCursor = true,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const shouldStart = whenInView ? inView : true;

  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!shouldStart) return;

    setShown("");
    setDone(false);
    let i = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const startId = setTimeout(() => {
      intervalId = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay, shouldStart]);

  return (
    <span ref={ref} className={className}>
      {shown}
      {showCursor && !done && (
        <span
          className="mr-0.5 inline-block w-[3px] translate-y-0.5 animate-pulse bg-[var(--sa-gold)]"
          style={{ height: "0.85em" }}
          aria-hidden
        />
      )}
      <span className="sr-only">{text}</span>
    </span>
  );
}
