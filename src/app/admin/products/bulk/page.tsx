import { AdminBulkUploadClient } from "@/components/admin/AdminBulkUploadClient";
import { listCategories } from "@/lib/cms";
import { getShanehFilters } from "@/lib/filters";

export const dynamic = "force-dynamic";

export default async function AdminBulkProductsPage() {
  const [categories, shanehOptions] = await Promise.all([
    listCategories({ activeOnly: true }),
    getShanehFilters(),
  ]);
  return <AdminBulkUploadClient categories={categories} shanehOptions={shanehOptions} />;
}
