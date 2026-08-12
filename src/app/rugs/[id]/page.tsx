import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts } from "@/lib/products";
import { getSupportPhone } from "@/lib/support";
import { RugDetail } from "@/components/rugs/RugDetail";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const rug = await getProduct(id);
  if (!rug) return { title: "محصول یافت نشد" };

  const title = rug.title;
  const description =
    rug.description?.slice(0, 160) ||
    `${rug.title} — فرش یاقوت، کد ${rug.code}`;
  const images = rug.image ? [{ url: rug.image, alt: rug.title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/rugs/${rug.id}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(`/rugs/${rug.id}`),
      images,
      locale: "fa_IR",
    },
  };
}

export default async function RugDetailPage({ params }: Props) {
  const { id } = await params;
  const [rug, related, support] = await Promise.all([
    getProduct(id),
    getRelatedProducts(id, 4),
    getSupportPhone(),
  ]);
  if (!rug) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: rug.title,
    description: rug.description,
    image: rug.image ? absoluteUrl(rug.image) : undefined,
    sku: rug.code,
    brand: { "@type": "Brand", name: "فرش یاقوت" },
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: rug.price,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/rugs/${rug.id}`),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RugDetail
        rug={rug}
        related={related}
        supportPhone={support.phone}
        supportPhoneDisplay={support.phoneDisplay}
      />
    </>
  );
}
