import type { OrderStatus } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

type OrderItem = { productId: string; qty: number };

/** Mark order PAID. Inventory tracking removed — no stock decrement. */
export async function markOrderPaid(
  tx: Prisma.TransactionClient,
  orderId: string,
  _items: OrderItem[],
  fromStatus: OrderStatus = "PENDING_PAYMENT",
) {
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
