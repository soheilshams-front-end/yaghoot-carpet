import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { adminHref } from "@/lib/admin-path";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(adminHref())}`);
  }
  return <AdminShell>{children}</AdminShell>;
}
