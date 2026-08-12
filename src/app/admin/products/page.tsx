import { AdminProductsClient } from "@/components/admin/AdminProductsClient";
import { listCategories } from "@/lib/cms";
import { listProductsAdmin } from "@/lib/products";
import { getShopFilterTaxonomy } from "@/lib/filters";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [items, categories, filters] = await Promise.all([
    listProductsAdmin(),
    listCategories({ activeOnly: true }),
    getShopFilterTaxonomy(),
  ]);
  return (
    <AdminProductsClient
      items={items}
      categories={categories}
      shanehOptions={filters.shaneh}
      colorOptions={filters.colors}
    />
  );
}
