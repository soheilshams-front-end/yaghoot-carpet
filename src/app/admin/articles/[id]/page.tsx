import { notFound } from "next/navigation";
import { AdminArticleForm } from "@/components/admin/AdminArticleForm";
import { getArticleById } from "@/lib/cms";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();
  return <AdminArticleForm article={article} />;
}
