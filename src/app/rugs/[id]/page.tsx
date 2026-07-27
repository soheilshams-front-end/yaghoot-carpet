import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts } from "@/lib/products";
import { getSupportPhone } from "@/lib/support";
import { RugDetail } from "@/components/rugs/RugDetail";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RugDetailPage({ params }: Props) {
  const { id } = await params;
  const [rug, related, support] = await Promise.all([
    getProduct(id),
    getRelatedProducts(id, 4),
    getSupportPhone(),
  ]);
  if (!rug) notFound();

  return (
    <RugDetail
      rug={rug}
      related={related}
      supportPhone={support.phone}
      supportPhoneDisplay={support.phoneDisplay}
    />
  );
}
