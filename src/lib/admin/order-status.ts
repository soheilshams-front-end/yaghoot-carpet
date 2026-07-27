import type { OrderStatus } from "@/generated/prisma/client";

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function allowedOrderStatuses(current: OrderStatus): OrderStatus[] {
  return [current, ...(ORDER_TRANSITIONS[current] ?? [])];
}
