import type { Metadata } from "next";
import { Suspense } from "react";
import { RugsShop } from "@/components/rugs/RugsShop";
import { SaSpinner } from "@/components/loading/SaSpinner";
import { countProducts, listProducts } from "@/lib/products";
import { listCategories } from "@/lib/cms";
import { getSupportPhone } from "@/lib/support";
import type { SortKey } from "@/components/rugs/SortDropdown";
import { BRAND_NAME } from "@/lib/brand";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "خرید فرش",
  description: `خرید آنلاین فرش از ${BRAND_NAME} — فرش کاشان و آران و بیدگل با قیمت درب کارخانه`,
  alternates: { canonical: "/rugs" },
  openGraph: {
    title: `خرید فرش | ${BRAND_NAME}`,
    description: `خرید آنلاین فرش از ${BRAND_NAME} — فرش کاشان و آران و بیدگل`,
    url: absoluteUrl("/rugs"),
  },
};

const VALID_SORT: SortKey[] = ["newest", "price-asc", "price-desc"];

type Props = {
  searchParams: Promise<{
    shaneh?: string;
    collection?: string;
    color?: string;
    q?: string;
    sort?: string;
  }>;
};

export default async function RugsPage({ searchParams }: Props) {
  const params = await searchParams;
  const shaneh = params.shaneh ? Number(params.shaneh) : null;
  const collection = (params.collection ?? "").trim() || null;
  const color = (params.color ?? "").trim() || null;
  const q = (params.q ?? "").trim();
  const sort: SortKey = VALID_SORT.includes(params.sort as SortKey)
    ? (params.sort as SortKey)
    : "newest";

  const [filtered, total, cats, support] = await Promise.all([
    listProducts({
      shaneh: Number.isFinite(shaneh) ? shaneh : null,
      collection,
      color,
      q: q || null,
    }),
    countProducts(),
    listCategories({ homeOnly: true, activeOnly: true }),
    getSupportPhone(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
          <SaSpinner size="lg" label="در حال بارگذاری فروشگاه…" />
        </div>
      }
    >
      <RugsShop
        rugs={filtered}
        total={total}
        shaneh={Number.isFinite(shaneh) ? shaneh : null}
        collection={collection}
        color={color}
        query={q || null}
        sort={sort}
        supportPhone={support.phone}
        supportPhoneDisplay={support.phoneDisplay}
        categories={cats.map((c) => ({ id: c.slug, title: c.title }))}
      />
    </Suspense>
  );
}
