"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AppChrome } from "@/components/AppChrome";
import { PatternFill } from "@/components/PatternFill";
import { confirmPaymentAction } from "@/lib/actions";
import { useToast } from "@/components/Toast";
import { useCart } from "@/components/CartProvider";
import { useLoading } from "@/components/loading/LoadingProvider";
import { SaSpinner } from "@/components/loading/SaSpinner";

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
  const { notify } = useToast();
  const { clear } = useCart();
  const { show, hide } = useLoading();
  const [loading, setLoading] = useState(false);

  async function finish(success: boolean) {
    if (!authority) return;
    setLoading(true);
    show(success ? "در حال تأیید پرداخت…" : "در حال لغو…");
    const res = await confirmPaymentAction(authority, success);
    setLoading(false);
    if (!res.ok) {
      hide();
      notify("پرداخت", res.error, "warn");
      router.push("/cart");
      return;
    }
    clear();
    show("پرداخت موفق — در حال انتقال…");
    notify("پرداخت موفق", `سفارش ${res.code} ثبت شد`);
    router.push(`/checkout/success?code=${encodeURIComponent(res.code)}`);
  }

  return (
    <section className="relative overflow-hidden px-4 py-10 sm:px-6">
      <PatternFill motif="islimi" opacity={0.03} />
      <div className="relative z-10 mx-auto max-w-md rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-6 text-center">
        <p className="text-xs font-semibold tracking-wide text-[var(--sa-gold)]">
          زرین‌پال · حالت آزمایشی
        </p>
        <h1 className="mt-2 text-xl font-bold text-[var(--sa-navy)]">درگاه پرداخت شبیه‌سازی‌شده</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--sa-text-muted)]">
          این صفحه جایگزین درگاه واقعی است. در production به زرین‌پال متصل می‌شود.
        </p>
        <p className="mt-2 break-all text-[11px] text-[var(--sa-text-muted)]">
          Authority: {authority || "—"}
        </p>
        <div className="mt-6 grid gap-2">
          <button
            type="button"
            disabled={loading || !authority}
            onClick={() => void finish(true)}
            className="h-11 rounded-xl bg-[var(--sa-navy)] text-sm font-semibold text-[var(--sa-text-on-navy)] disabled:opacity-50"
          >
            پرداخت موفق (Sandbox)
          </button>
          <button
            type="button"
            disabled={loading || !authority}
            onClick={() => void finish(false)}
            className="h-11 rounded-xl border border-[var(--sa-border)] bg-white text-sm text-[var(--sa-navy)] disabled:opacity-50"
          >
            انصراف از پرداخت
          </button>
          <Link href="/cart" className="mt-2 text-sm text-[var(--sa-text-muted)] hover:text-[var(--sa-navy)]">
            بازگشت به سبد
          </Link>
        </div>
      </div>
    </section>
  );
}
