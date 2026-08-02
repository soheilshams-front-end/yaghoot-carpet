import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MAX_IDS = 50;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { productIds?: string[] } | null;
  const productIds = Array.isArray(body?.productIds) ? body!.productIds.filter(Boolean) : [];
  if (!productIds.length) {
    return NextResponse.json({ ok: true as const, items: [] });
  }

  const unique = [...new Set(productIds)].slice(0, MAX_IDS);
  const products = await prisma.product.findMany({
    where: { id: { in: unique }, active: true },
    select: { id: true, active: true, stock: true, price: true, title: true },
  });
  return NextResponse.json({ ok: true as const, items: products });
}
