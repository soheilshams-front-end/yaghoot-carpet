import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { listCategories } from "@/lib/cms";
import { getProductAdmin } from "@/lib/products";
import { getShopFilterTaxonomy } from "@/lib/filters";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, filters] = await Promise.all([
    getProductAdmin(id),
    listCategories({ activeOnly: true }),
    getShopFilterTaxonomy(),
  ]);
  if (!product) notFound();
  return (
    <AdminProductForm
      product={product}
      categories={categories}
      shanehOptions={filters.shaneh}
      colorOptions={filters.colors}
    />
  );
}
