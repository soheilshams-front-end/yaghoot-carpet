import { AdminHomepageClient } from "@/components/admin/AdminHomepageClient";
import { getHomepageSections } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const sections = await getHomepageSections(false);
  return <AdminHomepageClient sections={sections} />;
}
