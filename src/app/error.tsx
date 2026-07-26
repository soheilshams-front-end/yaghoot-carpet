"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AppChrome } from "@/components/AppChrome";
import { PatternFill } from "@/components/PatternFill";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppChrome>
      <section className="relative overflow-hidden px-4 py-16 sm:px-6">
        <PatternFill motif="floral" opacity={0.04} />
        <div className="relative z-10 mx-auto max-w-md rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] px-6 py-12 text-center">
          <p className="text-xs font-medium tracking-wide text-[var(--sa-gold)]">فرش یاقوت</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--sa-navy)]">خطایی رخ داد</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--sa-text-muted)]">
            مشکلی پیش آمد. دوباره تلاش کنید یا به فروشگاه برگردید. اگر ادامه داشت، با پشتیبانی تماس بگیرید.
          </p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--sa-navy)] px-5 text-sm text-[var(--sa-text-on-navy)]"
            >
              تلاش مجدد
            </button>
            <Link
              href="/rugs"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--sa-border)] bg-white px-5 text-sm text-[var(--sa-navy)]"
            >
              فروشگاه
            </Link>
          </div>
          <a
            href="tel:09124496001"
            className="mt-5 inline-block text-xs text-[var(--sa-text-muted)] underline-offset-2 hover:text-[var(--sa-navy)] hover:underline"
          >
            پشتیبانی: ۰۹۱۲۴۴۹۶۰۰۱
          </a>
        </div>
      </section>
    </AppChrome>
  );
}
