import { AdminProductsClient } from "@/components/admin/AdminProductsClient";
import { listCategories } from "@/lib/cms";
import { listProductsAdmin } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [items, categories] = await Promise.all([
    listProductsAdmin(),
    listCategories({ activeOnly: true }),
  ]);
  return <AdminProductsClient items={items} categories={categories} />;
}
