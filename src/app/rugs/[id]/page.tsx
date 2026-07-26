import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts } from "@/lib/products";
import { RugDetail } from "@/components/rugs/RugDetail";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RugDetailPage({ params }: Props) {
  const { id } = await params;
  const rug = await getProduct(id);
  if (!rug) notFound();

  const related = await getRelatedProducts(id, 4);

  return <RugDetail rug={rug} related={related} />;
}
