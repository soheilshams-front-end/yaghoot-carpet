import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getArticleBySlug } from "@/lib/cms";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, { publishedOnly: true });
  if (!article) return { title: "مقاله یافت نشد" };

  const title = article.metaTitle || article.title;
  const description = article.metaDesc || article.excerpt || article.title;
  const url = absoluteUrl(`/articles/${article.slug}`);
  const images = article.coverImage
    ? [{ url: article.coverImage, alt: article.title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      locale: "fa_IR",
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, { publishedOnly: true });
  if (!article) notFound();

  const pageUrl = absoluteUrl(`/articles/${article.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.metaDesc || article.excerpt || article.title,
      image: article.coverImage ? absoluteUrl(article.coverImage) : undefined,
      datePublished: article.publishedAt?.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      mainEntityOfPage: pageUrl,
      author: { "@type": "Organization", name: "فرش یاقوت نقش مشهد" },
      publisher: {
        "@type": "Organization",
        name: "فرش یاقوت نقش مشهد",
        logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo.png") },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl() },
        {
          "@type": "ListItem",
          position: 2,
          name: "مقالات",
          item: absoluteUrl("/articles"),
        },
        { "@type": "ListItem", position: 3, name: article.title, item: pageUrl },
      ],
    },
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
              <Link href="/articles" className="hover:text-[var(--sa-navy)]">
                مقالات
              </Link>
            </nav>
            <h1 className="font-display text-3xl leading-[1.85] text-[var(--sa-navy)] sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-3 text-xs text-[var(--sa-navy-muted)]">
              {formatDate(article.publishedAt ?? article.createdAt)}
            </p>
            {article.excerpt && (
              <p className="mt-4 text-sm leading-7 text-[var(--sa-text-muted)]">
                {article.excerpt}
              </p>
            )}
          </div>
        </section>
      </div>

      <article className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-8">
          {article.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImage}
              alt=""
              className="w-full rounded-2xl border border-[var(--sa-border)] object-cover"
            />
          )}
          <div
            className="sa-prose"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />
        </div>
      </article>
    </div>
  );
}
