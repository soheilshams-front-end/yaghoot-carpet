"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PatternFill } from "@/components/PatternFill";
import { useCart, lineTotal } from "@/components/CartProvider";
import { useToast } from "@/components/Toast";
import { EmptyState } from "@/components/EmptyState";
import { formatPrice } from "@/data/rugs";
import { createOrderAction } from "@/lib/actions";
import { isValidIranMobile } from "@/lib/phone";
import { useLoading } from "@/components/loading/LoadingProvider";
import { SaSpinner } from "@/components/loading/SaSpinner";

const STEPS = ["آدرس ارسال", "خلاصه", "تأیید"] as const;

export type CheckoutProfile = {
  phone: string;
  city: string;
  address: string;
};

export function CheckoutClient({ profile }: { profile: CheckoutProfile }) {
  const router = useRouter();
  const { items, total, pruneNotice, clearPruneNotice, clear, ready } = useCart();
  const { notify } = useToast();
  const { show, hide } = useLoading();
  const [step, setStep] = useState(0);
  const [city, setCity] = useState(profile.city);
  const [address, setAddress] = useState(profile.address);
  const [phone, setPhone] = useState(profile.phone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addressHint, setAddressHint] = useState(false);

  const cityOk = city.trim().length >= 2;
  const addressOk = address.trim().length >= 8;
  const phoneOk = isValidIranMobile(phone);
  const canAddress = cityOk && addressOk && phoneOk;

  const summary = useMemo(
    () =>
      items.map((i) => ({
        ...i,
        line: lineTotal(i),
      })),
    [items],
  );

  function tryContinueFromAddress() {
    if (!canAddress) {
      setAddressHint(true);
      setError("برای ادامه خرید، شهر و آدرس کامل الزامی است.");
      notify("آدرس ناقص", "شهر و آدرس را کامل کنید", "warn");
      return;
    }
    setError("");
    setAddressHint(false);
    setStep(1);
  }

  async function submitOrder() {
    if (!canAddress) {
      setStep(0);
      setAddressHint(true);
      setError("قبل از ثبت سفارش، شهر و آدرس را تکمیل کنید.");
      return;
    }

    setLoading(true);
    setError("");
    show("در حال ثبت سفارش…");
    const res = await createOrderAction({
      city,
      address,
      phone,
      items: items.map((i) => ({
        productId: i.rugId,
        sizeId: i.sizeId,
        qty: i.qty,
      })),
    });
    setLoading(false);

    if (!res.ok) {
      hide();
      setStep(1);
      if ("needAuth" in res && res.needAuth) {
        router.push("/login?callbackUrl=/checkout");
        return;
      }
      if ("needAddress" in res && res.needAddress) {
        setStep(0);
        setAddressHint(true);
      }
      setError(res.error);
      notify("خطا", res.error, "warn");
      return;
    }

    clear();
    show("سفارش ثبت شد — در حال انتقال…");
    notify("سفارش ثبت شد", "همکاران ما برای هماهنگی پرداخت با شما تماس می‌گیرند");
    router.push(`/checkout/success?code=${encodeURIComponent(res.code)}`);
  }

  if (!ready) {
    return (
      <section className="relative overflow-hidden px-4 py-10 sm:px-6">
        <PatternFill motif="islimi" opacity={0.03} />
        <div className="relative z-10 mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center">
          <SaSpinner label="در حال بارگذاری سبد…" />
        </div>
      </section>
    );
  }

  if (items.length === 0 && step < 2) {
    return (
      <section className="relative overflow-hidden px-4 py-10 sm:px-6">
        <PatternFill motif="islimi" opacity={0.03} />
        <div className="relative z-10 mx-auto max-w-3xl">
          <EmptyState
            title="سبدی برای تسویه نیست"
            description="ابتدا از فروشگاه به سبد اضافه کنید."
            actionHref="/rugs"
            actionLabel="فروشگاه"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-10">
      <PatternFill motif="islimi" opacity={0.03} />
      <div className="relative z-10 mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--sa-navy)]">تسویه حساب</h1>
        <p className="mt-1 text-sm text-[var(--sa-text-muted)]">
          آدرس تحویل را کامل کنید؛ پس از ثبت، برای هماهنگی پرداخت با شما تماس می‌گیریم.
        </p>

        {pruneNotice && (
          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span>{pruneNotice}</span>
            <button type="button" onClick={clearPruneNotice} className="shrink-0 underline">
              باشه
            </button>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex-1 rounded-xl border px-3 py-2 text-center text-xs sm:text-sm ${
                i === step
                  ? "border-[var(--sa-gold)] bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
                  : i < step
                    ? "border-[var(--sa-border)] bg-[var(--sa-cream)] text-[var(--sa-navy)]"
                    : "border-[var(--sa-border)] bg-white text-[var(--sa-text-muted)]"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-5">
          {step === 0 && (
            <div className="space-y-3">
              <div
                className={`rounded-xl border px-3 py-2.5 text-xs leading-6 ${
                  addressHint
                    ? "border-[var(--sa-gold)] bg-[var(--sa-gold)]/10 text-[var(--sa-navy)]"
                    : "border-dashed border-[var(--sa-border)] bg-white/50 text-[var(--sa-text-muted)]"
                }`}
              >
                برای نهایی کردن خرید، وارد کردن <strong>شهر</strong> و{" "}
                <strong>آدرس دقیق</strong> الزامی است. هزینه و زمان ارسال پس از هماهنگی
                با شما مشخص می‌شود.
              </div>
              <Field
                id="checkout-city"
                label="شهر *"
                value={city}
                onChange={setCity}
                placeholder="مثلاً تهران"
                invalid={addressHint && !cityOk}
                errorText="شهر را وارد کنید"
              />
              <div className="block text-sm">
                <label htmlFor="checkout-address" className="mb-1 block text-[var(--sa-navy)]">
                  آدرس کامل *
                </label>
                <textarea
                  id="checkout-address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="خیابان، کوچه، پلاک، واحد…"
                  aria-invalid={addressHint && !addressOk ? true : undefined}
                  aria-describedby={
                    addressHint && !addressOk ? "checkout-address-error" : undefined
                  }
                  className={`w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-[var(--sa-gold)] ${
                    addressHint && !addressOk
                      ? "border-red-300"
                      : "border-[var(--sa-border)]"
                  }`}
                />
                {addressHint && !addressOk && (
                  <p id="checkout-address-error" className="mt-1 text-xs text-red-700">
                    آدرس را کامل‌تر بنویسید (حداقل چند کلمه)
                  </p>
                )}
              </div>
              <Field
                id="checkout-phone"
                label="شماره تماس *"
                value={phone}
                onChange={setPhone}
                placeholder="۰۹۱۲xxxxxxx"
                invalid={addressHint && !phoneOk}
                errorText="شماره تماس معتبر وارد کنید"
              />
              {error && <p className="text-sm text-red-700">{error}</p>}
              <div className="flex justify-between gap-2 pt-2">
                <Link href="/cart" className="text-sm text-[var(--sa-text-muted)] hover:text-[var(--sa-navy)]">
                  بازگشت به سبد
                </Link>
                <button
                  type="button"
                  onClick={tryContinueFromAddress}
                  className="h-10 rounded-xl bg-[var(--sa-navy)] px-5 text-sm text-[var(--sa-text-on-navy)]"
                >
                  ادامه
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <ul className="space-y-2">
                {summary.map((i) => (
                  <li
                    key={`${i.rugId}-${i.sizeId}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-[var(--sa-navy)]">
                      {i.title} · {i.sizeLabel} × {i.qty}
                    </span>
                    <span className="font-semibold text-[var(--sa-navy)]">
                      {formatPrice(i.line)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 border-t border-[var(--sa-border)] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--sa-text-muted)]">جمع محصولات</span>
                  <span className="text-base font-bold text-[var(--sa-navy)]">
                    {formatPrice(total)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--sa-text-muted)]">هزینه ارسال</span>
                  <span className="text-[var(--sa-navy)]">پس از هماهنگی</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--sa-text-muted)]">
                تحویل به {city} — {address} — {phone}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--sa-text-muted)]">
                ارسال پس از هماهنگی با شما انجام می‌شود؛ مبلغ ارسال در این مرحله محاسبه
                نشده است.
              </p>
              {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
              <div className="mt-4 flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="h-10 rounded-xl border border-[var(--sa-border)] px-4 text-sm text-[var(--sa-navy)]"
                >
                  ویرایش آدرس
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setStep(2);
                    void submitOrder();
                  }}
                  className="h-10 rounded-xl bg-[var(--sa-gold)] px-5 text-sm font-semibold text-[var(--sa-text)] disabled:opacity-50"
                >
                  {loading ? "در حال ثبت…" : "ثبت سفارش"}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-8 text-center text-sm">
              {loading ? (
                <p className="text-[var(--sa-text-muted)]">در حال ثبت سفارش…</p>
              ) : error ? (
                <div className="space-y-3">
                  <p className="text-red-700">{error}</p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-10 rounded-xl border border-[var(--sa-border)] px-4 text-sm text-[var(--sa-navy)]"
                  >
                    بازگشت به خلاصه
                  </button>
                  <button
                    type="button"
                    onClick={() => void submitOrder()}
                    className="mr-2 h-10 rounded-xl bg-[var(--sa-gold)] px-5 text-sm font-semibold"
                  >
                    تلاش مجدد
                  </button>
                </div>
              ) : (
                <p className="text-[var(--sa-text-muted)]">در حال ثبت سفارش…</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  invalid,
  errorText,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  invalid?: boolean;
  errorText?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="block text-sm">
      <label htmlFor={id} className="mb-1 block text-[var(--sa-navy)]">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={invalid && errorText ? errorId : undefined}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-[var(--sa-gold)] ${
          invalid ? "border-red-300" : "border-[var(--sa-border)]"
        }`}
      />
      {invalid && errorText && (
        <p id={errorId} className="mt-1 text-xs text-red-700">
          {errorText}
        </p>
      )}
    </div>
  );
}
