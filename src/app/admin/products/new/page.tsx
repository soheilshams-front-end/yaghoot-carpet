import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { listCategories } from "@/lib/cms";
import { getShopFilterTaxonomy } from "@/lib/filters";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const [categories, filters] = await Promise.all([
    listCategories({ activeOnly: true }),
    getShopFilterTaxonomy(),
  ]);
  return (
    <AdminProductForm
      product={null}
      categories={categories}
      shanehOptions={filters.shaneh}
      colorOptions={filters.colors}
    />
  );
}
