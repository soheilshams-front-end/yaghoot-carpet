import type { CSSProperties } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";

export const metadata: Metadata = {
  title: "Font check",
  robots: { index: false, follow: false },
};

const sample = "فرش یاقوت — هنر اصیل ایرانی در خانه شما";

const noto = localFont({
  src: "../../fonts/nastaliq/NotoNastaliqUrdu-Regular.woff2",
  display: "swap",
  weight: "400",
  style: "normal",
  adjustFontFallback: false,
});

const cases = [
  {
    id: "A",
    title: "A — IranNastaliq بدون فیچر",
    className: "font-display",
    style: {
      fontFeatureSettings: "normal",
      WebkitFontFeatureSettings: "normal",
    } as CSSProperties,
  },
  {
    id: "B",
    title: "B — IranNastaliq با cswh (تنظیم فعلی سایت)",
    className: "font-display",
    style: undefined,
  },
  {
    id: "C",
    title: "C — IranNastaliq فقط calt + rlig",
    className: "font-display",
    style: {
      fontFeatureSettings: '"calt" 1, "rlig" 1, "liga" 1, "kern" 1',
      WebkitFontFeatureSettings: '"calt" 1, "rlig" 1, "liga" 1, "kern" 1',
    } as CSSProperties,
  },
  {
    id: "D",
    title: "D — Noto Nastaliq Urdu",
    className: noto.className,
    style: {
      lineHeight: 1.85,
      letterSpacing: 0,
      fontSynthesis: "none",
      textRendering: "geometricPrecision",
    } as CSSProperties,
  },
] as const;

export default function FontCheckPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10" dir="rtl">
      <header className="space-y-2">
        <h1 className="text-xl font-bold text-[var(--sa-navy)]">تست فونت نستعلیق</h1>
        <p className="text-sm text-[var(--sa-text-muted)]">
          این صفحه فقط برای تشخیص روی آیفون است. بگویید کدام نمونه (A/B/C/D) حروف را درست و
          به‌هم‌چسبیده نشان می‌دهد.
        </p>
      </header>

      {cases.map((c) => (
        <section
          key={c.id}
          className="rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-5"
        >
          <p className="mb-3 text-xs font-semibold text-[var(--sa-navy-muted)]">{c.title}</p>
          <p className={`${c.className} text-3xl text-[var(--sa-navy)] sm:text-4xl`} style={c.style}>
            {sample}
          </p>
        </section>
      ))}
    </div>
  );
}
