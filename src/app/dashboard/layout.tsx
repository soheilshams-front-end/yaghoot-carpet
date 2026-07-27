import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppChrome } from "@/components/AppChrome";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { prisma } from "@/lib/db";
import { adminHref } from "@/lib/admin-path";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");
  if (session.user.role === "ADMIN") redirect(adminHref());

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return (
    <DashboardShell
      userName={user?.name ?? session.user.name ?? "کاربر"}
      userCity={user?.city ?? "—"}
    >
      <AppChrome>{children}</AppChrome>
    </DashboardShell>
  );
}
