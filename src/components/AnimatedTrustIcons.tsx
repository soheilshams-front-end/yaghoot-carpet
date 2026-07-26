"use client";

import { motion } from "framer-motion";

type Props = {
  size?: number;
  className?: string;
};

const drawLoop = {
  duration: 3.2,
  repeat: Infinity,
  ease: "easeInOut" as const,
  times: [0, 0.35, 0.7, 1] as number[],
};

/** Lightweight SVG stroke-draw micro-animations */
export function AnimTruck({ size = 16, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <motion.path
        d="M3 7h11v10H3V7Z"
        initial={{ pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0.35, 1, 1, 0.35] }}
        transition={{ ...drawLoop, delay: 0 }}
      />
      <motion.path
        d="M14 10h4l3 3v4h-7v-7Z"
        initial={{ pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0.35, 1, 1, 0.35] }}
        transition={{ ...drawLoop, delay: 0.12 }}
      />
      <motion.circle
        cx="7.5"
        cy="17.5"
        r="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.25, 0.45, 0.75, 1],
        }}
      />
      <motion.circle
        cx="17.5"
        cy="17.5"
        r="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.28, 0.48, 0.75, 1],
        }}
      />
    </svg>
  );
}

export function AnimShield({ size = 16, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <motion.path
        d="M12 3 5 6v5c0 5 3.2 8.2 7 9.5 3.8-1.3 7-4.5 7-9.5V6l-7-3Z"
        initial={{ pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0.35, 1, 1, 0.35] }}
        transition={drawLoop}
      />
      <motion.path
        d="m9 12 2 2 4-4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.28, 0.45, 0.75, 1],
        }}
      />
    </svg>
  );
}

export function AnimTag({ size = 16, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <motion.path
        d="M20 13.2 12.8 20.4a2 2 0 0 1-2.8 0L3.6 14A2 2 0 0 1 3 12.6V5.5A1.5 1.5 0 0 1 4.5 4H11a2 2 0 0 1 1.4.6L20 12a2 2 0 0 1 0 2.8Z"
        initial={{ pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0.35, 1, 1, 0.35] }}
        transition={drawLoop}
      />
      <motion.circle
        cx="8"
        cy="8"
        r="1.2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.3, 0.48, 0.75, 1],
        }}
      />
    </svg>
  );
}
