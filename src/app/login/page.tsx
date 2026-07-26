"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, Suspense, useState } from "react";
import { AppChrome } from "@/components/AppChrome";
import { PatternFill } from "@/components/PatternFill";
import { useLoading } from "@/components/loading/LoadingProvider";
import { SaSpinner } from "@/components/loading/SaSpinner";

export default function LoginPage() {
  return (
    <AppChrome>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center px-4 py-16">
            <SaSpinner label="در حال بارگذاری…" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AppChrome>
  );
}

function safeCallbackUrl(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return "/dashboard";
  }
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));
  const { show, hide } = useLoading();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    show("در حال ورود…");
    try {
      const res = await signIn("credentials", {
        phone,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("شماره موبایل یا رمز عبور نادرست است");
        hide();
        setLoading(false);
        return;
      }
      show("ورود موفق — در حال انتقال…");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("خطایی رخ داد؛ دوباره تلاش کنید");
      hide();
      setLoading(false);
    }
  }

  return (
    <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      <PatternFill motif="islimi" opacity={0.03} />
      <div className="relative z-10 mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-[var(--sa-navy)]">ورود به حساب</h1>
        <p className="mt-2 text-sm text-[var(--sa-text-muted)]">
          با شماره موبایل وارد شوید.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-3 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-5"
        >
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--sa-navy)]">شماره موبایل</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="۰۹۱۲xxxxxxx"
              className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--sa-gold)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--sa-navy)]">رمز عبور</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--sa-gold)]"
            />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[var(--sa-navy)] text-sm font-semibold text-[var(--sa-text-on-navy)] disabled:opacity-60"
          >
            {loading ? "در حال ورود…" : "ورود"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--sa-text-muted)]">
          حساب ندارید؟{" "}
          <Link href="/register" className="text-[var(--sa-navy)] underline-offset-2 hover:underline">
            ثبت‌نام
          </Link>
        </p>
      </div>
    </section>
  );
}
