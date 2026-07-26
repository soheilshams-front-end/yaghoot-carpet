import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { listCategories } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const categories = await listCategories({ activeOnly: true });
  return <AdminProductForm product={null} categories={categories} />;
}
