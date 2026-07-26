import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";
import { listCategories } from "@/lib/cms";
import { listProductsAdmin } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    listCategories(),
    listProductsAdmin(),
  ]);
  return <AdminCategoriesClient categories={categories} products={products} />;
}
