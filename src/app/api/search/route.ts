import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";
import { collectionLabel } from "@/data/rugs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 1) {
    return NextResponse.json({ items: [] as const });
  }

  const rugs = await searchProducts(q, 7);
  const items = rugs.map((r) => ({
    id: r.id,
    title: r.title,
    code: r.code,
    price: r.price,
    image: r.image,
    shaneh: r.shaneh,
    collection: collectionLabel(r.collection),
    stock: r.stock,
  }));

  return NextResponse.json({ items });
}
