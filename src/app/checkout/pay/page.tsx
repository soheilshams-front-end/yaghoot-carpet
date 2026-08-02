"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppChrome } from "@/components/AppChrome";
import { PatternFill } from "@/components/PatternFill";
import { SaSpinner } from "@/components/loading/SaSpinner";
import { SUPPORT_FALLBACK } from "@/lib/support-shared";

export default function PayPage() {
  return (
    <AppChrome>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center px-4 py-16">
            <SaSpinner label="در حال بارگذاری…" />
          </div>
        }
      >
        <PayView />
      </Suspense>
    </AppChrome>
  );
}

function PayView() {
  const params = useSearchParams();
  const authority = params.get("authority") ?? "";
  const router = useRouter();

  return (
    <section className="relative overflow-hidden px-4 py-10 sm:px-6">
      <PatternFill motif="islimi" opacity={0.03} />
      <div className="relative z-10 mx-auto max-w-md rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-6 text-center">
        <p className="text-xs font-semibold tracking-wide text-[var(--sa-gold)]">فرش یاقوت</p>
        <h1 className="mt-2 text-xl font-bold text-[var(--sa-navy)]">سفارش در انتظار هماهنگی</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--sa-text-muted)]">
          پرداخت آنلاین هنوز فعال نیست. سفارش شما ثبت شده و همکاران ما برای هماهنگی
          پرداخت و ارسال با شما تماس می‌گیرند.
        </p>
        {authority && (
          <p className="mt-2 break-all text-[11px] text-[var(--sa-text-muted)]">
            کد پیگیری: {authority}
          </p>
        )}
        <div className="mt-6 grid gap-2">
          <Link
            href="/dashboard"
            className="flex h-11 items-center justify-center rounded-xl bg-[var(--sa-navy)] text-sm font-semibold text-[var(--sa-text-on-navy)]"
          >
            مشاهده سفارش‌ها
          </Link>
          <button
            type="button"
            onClick={() => router.push("/rugs")}
            className="h-11 rounded-xl border border-[var(--sa-border)] bg-white text-sm text-[var(--sa-navy)]"
          >
            ادامه خرید
          </button>
          <a
            href={`tel:${SUPPORT_FALLBACK.phone}`}
            className="mt-2 text-sm text-[var(--sa-text-muted)] hover:text-[var(--sa-navy)]"
          >
            تماس پشتیبانی: {SUPPORT_FALLBACK.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
