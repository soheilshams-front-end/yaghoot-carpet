import { notFound } from "next/navigation";
import { AdminOrderDetailClient } from "@/components/admin/AdminOrderDetailClient";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const o = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      items: { include: { product: { select: { title: true } } } },
    },
  });
  if (!o) notFound();

  return (
    <AdminOrderDetailClient
      order={{
        id: o.id,
        code: o.code,
        status: o.status,
        city: o.city,
        address: o.address,
        phone: o.phone,
        total: o.total,
        paymentRef: o.paymentRef,
        createdAt: new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(o.createdAt),
        userName: o.user.name,
        items: o.items.map((it) => ({
          title: it.product.title,
          sizeLabel: it.sizeLabel,
          qty: it.qty,
          unitPrice: it.unitPrice,
          lineTotal: it.lineTotal,
        })),
      }}
    />
  );
}
