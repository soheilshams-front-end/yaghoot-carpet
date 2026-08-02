"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppChrome } from "@/components/AppChrome";
import { PatternFill } from "@/components/PatternFill";
import { LogoMark, IconPhone, IconShield, IconCheck } from "@/components/Icons";
import { registerAction } from "@/lib/auth-actions";
import { img } from "@/lib/images";
import { useLoading } from "@/components/loading/LoadingProvider";
import { SaSpinner } from "@/components/loading/SaSpinner";

const ease = [0.22, 1, 0.36, 1] as const;

function safeCallbackUrl(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return "/dashboard";
  }
  return raw;
}

export default function RegisterPage() {
  return (
    <AppChrome>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center px-4 py-16">
            <SaSpinner label="در حال بارگذاری…" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AppChrome>
  );
}

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));
  const { show, hide } = useLoading();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد");
      setLoading(false);
      return;
    }
    show("در حال ایجاد حساب…");
    try {
      const res = await registerAction(fd);
      if (!res.ok) {
        setError(res.error);
        hide();
        setLoading(false);
        return;
      }
      show("حساب ساخته شد — در حال ورود…");
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } catch {
      setError("خطایی رخ داد؛ دوباره تلاش کنید");
      hide();
      setLoading(false);
    }
  }

  return (
      <section className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 15% 20%, color-mix(in srgb, var(--sa-gold) 18%, transparent), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 80%, color-mix(in srgb, var(--sa-navy) 12%, transparent), transparent 50%), linear-gradient(165deg, var(--sa-cream) 0%, var(--sa-bg) 45%, #e4d9c8 100%)",
          }}
        />
        <PatternFill motif="islimi" opacity={0.04} />

        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-6xl lg:grid-cols-[1.05fr_0.95fr]">
          {/* Visual panel — brand + atmosphere */}
          <motion.aside
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease }}
            className="relative hidden overflow-hidden lg:block"
          >
            <div className="absolute inset-4 overflow-hidden rounded-[28px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.hero}
                alt=""
                className="absolute inset-0 h-full w-full scale-105 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--sa-navy)] via-[var(--sa-navy)]/75 to-[var(--sa-navy)]/35" />
              <PatternFill motif="floral" opacity={0.08} />

              <div className="absolute inset-0 flex flex-col justify-between p-8 xl:p-10">
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.55, ease }}
                  className="flex items-center gap-3 text-[var(--sa-gold)]"
                >
                  <LogoMark size={44} />
                  <div>
                    <p className="text-xl font-bold tracking-wide">فرش یاقوت</p>
                    <p className="text-xs text-[var(--sa-text-on-navy)]/65">عضویت در خانواده یاقوت</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.65, ease }}
                  className="max-w-sm"
                >
                  <h2 className="text-3xl font-bold leading-snug text-[var(--sa-text-on-navy)] xl:text-[2.1rem]">
                    خرید مستقیم از کارخانه، با حساب شخصی شما
                  </h2>
                  <ul className="mt-6 space-y-3">
                    {[
                      "پیگیری سفارش و ارسال",
                      "علاقه‌مندی و سوابق خرید",
                      "دسترسی به قیمت درب کارخانه",
                    ].map((t, i) => (
                      <motion.li
                        key={t}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55 + i * 0.08, duration: 0.45, ease }}
                        className="flex items-center gap-2.5 text-sm text-[var(--sa-text-on-navy)]/85"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sa-gold)]/20 text-[var(--sa-gold)]">
                          <IconCheck size={12} />
                        </span>
                        {t}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </motion.aside>

          {/* Form panel */}
          <div className="flex items-center px-4 py-10 sm:px-8 sm:py-12 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease }}
              className="mx-auto w-full max-w-md"
            >
              <div className="mb-7 flex items-center gap-3 lg:hidden">
                <LogoMark size={36} />
                <span className="text-lg font-bold text-[var(--sa-navy)]">فرش یاقوت</span>
              </div>

              <p className="text-xs font-semibold tracking-wide text-[var(--sa-gold)]">
                ایجاد حساب کاربری
              </p>
              <h1 className="mt-1.5 text-3xl font-bold text-[var(--sa-navy)] sm:text-[2rem]">
                ثبت‌نام
              </h1>
              <p className="mt-2 text-sm leading-7 text-[var(--sa-text-muted)]">
                فقط با شماره موبایل ثبت‌نام کنید؛ شهر و آدرس هنگام خرید گرفته می‌شود.
              </p>

              <form onSubmit={onSubmit} className="mt-7 space-y-3.5">
                <Field
                  name="phone"
                  label="شماره موبایل"
                  type="tel"
                  placeholder="۰۹۱۲xxxxxxx"
                  required
                  icon={<IconPhone size={16} />}
                />
                <Field
                  name="password"
                  label="رمز عبور"
                  type={showPass ? "text" : "password"}
                  placeholder="حداقل ۸ کاراکتر"
                  required
                  minLength={8}
                  hint="رمز باید حداقل ۸ کاراکتر باشد"
                  icon={<IconShield size={16} />}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="text-[11px] font-medium text-[var(--sa-navy-muted)] hover:text-[var(--sa-navy)]"
                    >
                      {showPass ? "پنهان" : "نمایش"}
                    </button>
                  }
                />
                <Field
                  name="passwordConfirm"
                  label="تأیید رمز عبور"
                  type={showPass ? "text" : "password"}
                  placeholder="تکرار رمز عبور"
                  required
                  minLength={8}
                  icon={<IconShield size={16} />}
                />

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  className="relative mt-1 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--sa-navy)] text-sm font-semibold text-[var(--sa-text-on-navy)] disabled:opacity-60"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-[var(--sa-gold)]"
                  />
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      در حال ایجاد حساب…
                    </span>
                  ) : (
                    "ایجاد حساب یاقوت"
                  )}
                </motion.button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-[var(--sa-border)]" />
                <span className="text-[11px] text-[var(--sa-text-muted)]">یا</span>
                <span className="h-px flex-1 bg-[var(--sa-border)]" />
              </div>

              <p className="mt-5 text-center text-sm text-[var(--sa-text-muted)]">
                قبلاً عضو شده‌اید؟{" "}
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="font-semibold text-[var(--sa-navy)] underline decoration-[var(--sa-gold)]/50 underline-offset-4 hover:decoration-[var(--sa-gold)]"
                >
                  ورود به حساب
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
  icon,
  trailing,
  minLength,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  minLength?: number;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-[var(--sa-navy)]">{label}</span>
      <span className="flex h-12 items-center gap-2.5 rounded-xl border border-[var(--sa-border)] bg-white/80 px-3.5 shadow-[0_1px_0_rgba(30,58,95,0.04)] transition focus-within:border-[var(--sa-gold)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--sa-gold)]/25">
        {icon && <span className="shrink-0 text-[var(--sa-navy-muted)]">{icon}</span>}
        <input
          name={name}
          type={type}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-[var(--sa-navy)] outline-none placeholder:text-[var(--sa-text-muted)]/55"
        />
        {trailing}
      </span>
      {hint && (
        <span className="mt-1.5 block text-[11px] text-[var(--sa-text-muted)]">{hint}</span>
      )}
    </label>
  );
}
