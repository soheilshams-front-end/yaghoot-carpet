import Link from "next/link";
import { AppChrome } from "@/components/AppChrome";
import { PatternFill } from "@/components/PatternFill";

export default function NotFound() {
  return (
    <AppChrome>
      <section className="relative overflow-hidden px-4 py-16 sm:px-6">
        <PatternFill motif="islimi" opacity={0.04} />
        <div className="relative z-10 mx-auto max-w-md rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] px-6 py-12 text-center">
          <p className="text-xs font-medium tracking-wide text-[var(--sa-gold)]">فرش یاقوت</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--sa-navy)]">صفحه پیدا نشد</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--sa-text-muted)]">
            این مسیر در فروشگاه یاقوت وجود ندارد. می‌توانید به خانه برگردید یا از فروشگاه ادامه دهید.
          </p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--sa-navy)] px-5 text-sm text-[var(--sa-text-on-navy)]"
            >
              صفحه اصلی
            </Link>
            <Link
              href="/rugs"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--sa-border)] bg-white px-5 text-sm text-[var(--sa-navy)]"
            >
              فروشگاه
            </Link>
          </div>
        </div>
      </section>
    </AppChrome>
  );
}
