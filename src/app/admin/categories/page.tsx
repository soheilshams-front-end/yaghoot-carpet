import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";
import { listCategories } from "@/lib/cms";
import { listProductsAdmin } from "@/lib/products";
import { getShopFilterTaxonomy } from "@/lib/filters";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, products, filters] = await Promise.all([
    listCategories(),
    listProductsAdmin(),
    getShopFilterTaxonomy(),
  ]);
  return (
    <AdminCategoriesClient
      categories={categories}
      products={products}
      shanehOptions={filters.shaneh}
      colorOptions={filters.colors}
    />
  );
}
