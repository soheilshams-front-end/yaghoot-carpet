import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/login");

  return (
    <UserDashboard user={data.user} orders={data.orders} />
  );
}
