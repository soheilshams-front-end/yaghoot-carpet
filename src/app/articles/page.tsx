import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { listArticles } from "@/lib/cms";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مقالات",
  description:
    "مقالات و راهنمای خرید فرش از فرش یاقوت نقش مشهد — کاشان و آران و بیدگل",
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "مقالات | فرش یاقوت نقش مشهد",
    description:
      "مقالات و راهنمای خرید فرش از فرش یاقوت نقش مشهد — کاشان و آران و بیدگل",
    url: absoluteUrl("/articles"),
  },
};

function formatDate(d: Date | null) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(d));
  } catch {
    return "";
  }
}

export default async function ArticlesPage() {
  const articles = await listArticles({ publishedOnly: true });

  return (
    <div className="sa-page">
      <div className="sa-top border-b border-[var(--sa-border)]">
        <SiteHeader />
        <section className="px-4 pb-10 pt-6 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-3xl leading-[1.85] text-[var(--sa-navy)] sm:text-4xl">
              مقالات
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--sa-text-muted)] sm:text-base">
              راهنماها و نوشته‌های تخصصی درباره فرش ایرانی و خرید هوشمند
            </p>
          </div>
        </section>
      </div>

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.length === 0 && (
            <p className="col-span-full text-center text-sm text-[var(--sa-text-muted)]">
              هنوز مقاله‌ای منتشر نشده است.
            </p>
          )}
          {articles.map((a) => (
            <Link
              key={a.id}
              href={`/articles/${a.slug}`}
              className="group overflow-hidden rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] transition hover:border-[var(--sa-gold)]"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[var(--sa-cream)]">
                {a.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.coverImage}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[var(--sa-text-muted)]">
                    بدون تصویر
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <p className="text-[11px] text-[var(--sa-navy-muted)]">
                  {formatDate(a.publishedAt ?? a.createdAt)}
                </p>
                <h2 className="text-base font-bold text-[var(--sa-navy)] group-hover:text-[var(--sa-gold)]">
                  {a.title}
                </h2>
                {a.excerpt && (
                  <p className="line-clamp-3 text-xs leading-6 text-[var(--sa-text-muted)]">
                    {a.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
