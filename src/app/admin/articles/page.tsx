import { AdminArticlesClient } from "@/components/admin/AdminArticlesClient";
import { listArticlesAdmin } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await listArticlesAdmin();
  return <AdminArticlesClient articles={articles} />;
}
