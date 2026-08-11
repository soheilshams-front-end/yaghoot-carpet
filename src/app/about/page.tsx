import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SaButton } from "@/components/SaButton";
import {
  BRAND_ADDRESS,
  BRAND_NAME,
  localBusinessJsonLd,
} from "@/lib/brand";
import { absoluteUrl } from "@/lib/site-url";
import { getSupportPhone } from "@/lib/support";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: `درباره ${BRAND_NAME} | کاشان و آران و بیدگل`,
  },
  description: `${BRAND_NAME} — کارخانه و فروشگاه فرش در شهرک سلیمان صباحی آران و بیدگل، قطب فرش کاشان. درباره برند و خرید مستقیم از کارخانه.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `درباره ${BRAND_NAME} | کاشان و آران و بیدگل`,
    description: `${BRAND_NAME} در آران و بیدگل — معرفی برند و موقعیت کارخانه در قطب فرش کاشان`,
    url: absoluteUrl("/about"),
  },
};

export default async function AboutPage() {
  const support = await getSupportPhone();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: `درباره ${BRAND_NAME}`,
      url: absoluteUrl("/about"),
      description: `معرفی ${BRAND_NAME} و کارخانه در آران و بیدگل`,
      mainEntity: localBusinessJsonLd({ telephone: support.phone }),
    },
    localBusinessJsonLd({ telephone: support.phone }),
  ];

  return (
    <div className="sa-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="sa-top border-b border-[var(--sa-border)]">
        <SiteHeader />
        <section className="px-4 pb-8 pt-6 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <nav className="mb-4 text-xs text-[var(--sa-text-muted)]">
              <Link href="/" className="hover:text-[var(--sa-navy)]">
                خانه
              </Link>
              <span className="mx-1.5">/</span>
              <span>درباره ما</span>
            </nav>
            <h1 className="font-display text-3xl leading-[1.85] text-[var(--sa-navy)] sm:text-4xl">
              {BRAND_NAME}
            </h1>
            <p className="mt-3 text-sm text-[var(--sa-text-muted)] sm:text-base">
              کارخانه و فروشگاه آنلاین فرش در آران و بیدگل — قطب فرش کاشان
            </p>
          </div>
        </section>
      </div>

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6 text-sm leading-8 text-[var(--sa-text)] sm:text-base sm:leading-9">
          <p>
            <strong className="text-[var(--sa-navy)]">{BRAND_NAME}</strong> مجموعهٔ
            تخصصی تولید و فروش فرش است که با تمرکز بر کیفیت بافت، تنوع طرح و قیمت
            درب کارخانه، خرید مستقیم از کارخانه را برای سراسر ایران ممکن کرده است.
          </p>
          <p>
            نام «نقش مشهد» بخشی از هویت برند است و به میراث نقوش و سبک‌های اصیل
            ایرانی اشاره دارد؛ نشانی فیزیکی کارخانه و فروشگاه ما در{" "}
            <strong className="text-[var(--sa-navy)]">
              {BRAND_ADDRESS.streetAddress}، {BRAND_ADDRESS.addressLocality}
            </strong>{" "}
            (استان {BRAND_ADDRESS.addressRegion}) قرار دارد — در قلب قطب فرش{" "}
            <strong className="text-[var(--sa-navy)]">کاشان</strong>.
          </p>
          <p>
            اگر «فرش یاقوت مشهد»، «فرش یاقوت کاشان» یا «فرش یاقوت آران و بیدگل» را
            جستجو کرده‌اید، همین‌جا هستید: برند یاقوت نقش مشهد با تولید در آران و
            بیدگل و پوشش ارسال به سراسر کشور.
          </p>
          <p>
            برای مشاهدهٔ طرح‌ها و خرید آنلاین به{" "}
            <Link href="/rugs" className="font-semibold text-[var(--sa-navy)] underline-offset-4 hover:underline">
              فروشگاه
            </Link>{" "}
            سر بزنید یا از{" "}
            <Link href="/articles" className="font-semibold text-[var(--sa-navy)] underline-offset-4 hover:underline">
              مقالات
            </Link>{" "}
            راهنمای انتخاب فرش را بخوانید.
          </p>

          <div className="rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-5 text-sm">
            <p className="font-semibold text-[var(--sa-navy)]">آدرس و تماس</p>
            <p className="mt-2 text-[var(--sa-text-muted)]">
              {BRAND_ADDRESS.streetAddress}، {BRAND_ADDRESS.addressLocality} —{" "}
              قطب فرش کاشان
            </p>
            <p className="mt-2">
              <a href={`tel:${support.phone}`} className="hover:underline">
                {support.phoneDisplay}
              </a>
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <SaButton href="/rugs" variant="solid">
              مشاهده فروشگاه
            </SaButton>
            <SaButton href="/articles" variant="outline">
              مقالات
            </SaButton>
          </div>
        </div>
      </section>
    </div>
  );
}
