"use client";

import { useEffect } from "react";

/** Softens native smooth scroll timing feel via CSS + anchor offset */
export function SmoothScroll() {
  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollBehavior = "smooth";

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
