import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppChrome } from "@/components/AppChrome";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return (
    <AppChrome>
      <CheckoutClient
        profile={{
          phone: user?.phone ?? session.user.phone ?? "",
          city: user?.city ?? "",
          address: user?.address ?? "",
        }}
      />
    </AppChrome>
  );
}
