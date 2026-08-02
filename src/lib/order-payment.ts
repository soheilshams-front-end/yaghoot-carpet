import type { OrderStatus } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

type OrderItem = { productId: string; qty: number };

/** Atomically decrement stock and mark order PAID. Throws INSUFFICIENT_STOCK or STATUS_RACE. */
export async function markOrderPaid(
  tx: Prisma.TransactionClient,
  orderId: string,
  items: OrderItem[],
  fromStatus: OrderStatus = "PENDING_PAYMENT",
) {
  for (const item of items) {
    const stockUpdate = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.qty } },
      data: { stock: { decrement: item.qty } },
    });
    if (stockUpdate.count === 0) {
      throw new Error("INSUFFICIENT_STOCK");
    }
  }

  const statusUpdate = await tx.order.updateMany({
    where: { id: orderId, status: fromStatus },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });
  if (statusUpdate.count === 0) {
    throw new Error("STATUS_RACE");
  }
}
