import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppChrome } from "@/components/AppChrome";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

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
