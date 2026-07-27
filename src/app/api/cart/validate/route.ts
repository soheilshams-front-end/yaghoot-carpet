import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { productIds?: string[] } | null;
  const productIds = Array.isArray(body?.productIds) ? body!.productIds.filter(Boolean) : [];
  if (!productIds.length) {
    return NextResponse.json({ ok: true as const, items: [] });
  }

  const unique = [...new Set(productIds)];
  const products = await prisma.product.findMany({
    where: { id: { in: unique } },
    select: { id: true, active: true, stock: true, price: true, title: true },
  });
  return NextResponse.json({ ok: true as const, items: products });
}
