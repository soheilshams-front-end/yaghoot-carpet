import { AdminMediaClient } from "@/components/admin/AdminMediaClient";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const items = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <AdminMediaClient
      items={items.map((m) => ({
        id: m.id,
        url: m.url,
        alt: m.alt,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
