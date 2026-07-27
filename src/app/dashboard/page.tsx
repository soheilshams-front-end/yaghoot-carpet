import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { getDashboardData } from "@/lib/dashboard";
import { getSupportPhone } from "@/lib/support";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  const [data, support] = await Promise.all([
    getDashboardData(session.user.id),
    getSupportPhone(),
  ]);
  if (!data) redirect("/login");

  return (
    <UserDashboard
      user={data.user}
      orders={data.orders}
      supportPhone={support.phone}
      supportPhoneDisplay={support.phoneDisplay}
    />
  );
}
