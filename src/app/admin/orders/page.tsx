import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const rows = await prisma.order.findMany({
    select: {
      id: true,
      code: true,
      status: true,
      city: true,
      phone: true,
      total: true,
      createdAt: true,
      user: { select: { name: true } },
      items: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const orders = rows.map((o) => ({
    id: o.id,
    code: o.code,
    status: o.status,
    city: o.city,
    phone: o.phone,
    total: o.total,
    createdAt: o.createdAt.toISOString(),
    userName: o.user.name,
    itemCount: o.items.length,
  }));

  return <AdminOrdersClient orders={orders} />;
}
