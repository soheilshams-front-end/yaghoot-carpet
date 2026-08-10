"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  deleteArticleAction,
  toggleArticlePublishedAction,
} from "@/lib/admin/actions";
import { adminHref } from "@/lib/admin-path";
import type { CmsArticle } from "@/lib/cms";

type Props = {
  articles: CmsArticle[];
};

function formatDate(d: Date | null) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(d));
  } catch {
    return "—";
  }
}

export function AdminArticlesClient({ articles }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim();
    if (!s) return articles;
    return articles.filter(
      (a) => a.title.includes(s) || a.slug.includes(s) || a.excerpt.includes(s),
    );
  }, [articles, q]);

  async function remove(a: CmsArticle) {
    const ok = await confirm({
      title: "حذف مقاله",
      description: `مقاله «${a.title}» حذف شود؟ این کار قابل بازگشت نیست.`,
      confirmLabel: "حذف",
      tone: "danger",
    });
    if (!ok) return;
    start(async () => {
      await deleteArticleAction(a.id);
      router.refresh();
    });
  }

  function toggle(a: CmsArticle) {
    start(async () => {
      await toggleArticlePublishedAction(a.id, !a.published);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminHeader title="مقالات" subtitle="مدیریت مقالات وبلاگ برای سئو" />
        <Link
          href={adminHref("/articles/new")}
          className="rounded-xl bg-[var(--sa-navy)] px-4 py-2 text-sm font-semibold text-[var(--sa-text-on-navy)]"
        >
          مقاله جدید
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جست‌وجو در عنوان یا اسلاگ…"
          className="min-w-[220px] flex-1 rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sa-gold)]"
        />
        <p className="text-xs text-[var(--sa-text-muted)]">{filtered.length} مقاله</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--sa-border)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--sa-bg)] text-xs text-[var(--sa-navy-muted)]">
            <tr>
              <th className="px-3 py-2.5 text-right font-medium">عنوان</th>
              <th className="hidden px-3 py-2.5 text-right font-medium sm:table-cell">اسلاگ</th>
              <th className="px-3 py-2.5 text-right font-medium">وضعیت</th>
              <th className="hidden px-3 py-2.5 text-right font-medium md:table-cell">تاریخ</th>
              <th className="px-3 py-2.5 text-left font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-[var(--sa-text-muted)]">
                  مقاله‌ای نیست. یک مقاله جدید بسازید.
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-[var(--sa-border)]">
                <td className="px-3 py-3">
                  <Link
                    href={adminHref(`/articles/${a.id}`)}
                    className="font-medium text-[var(--sa-navy)] hover:underline"
                  >
                    {a.title}
                  </Link>
                </td>
                <td className="hidden px-3 py-3 font-mono text-xs text-[var(--sa-text-muted)] sm:table-cell" dir="ltr">
                  /articles/{a.slug}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                      a.published
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {a.published ? "منتشرشده" : "پیش‌نویس"}
                  </span>
                </td>
                <td className="hidden px-3 py-3 text-xs text-[var(--sa-text-muted)] md:table-cell">
                  {formatDate(a.publishedAt ?? a.updatedAt)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Link
                      href={adminHref(`/articles/${a.id}`)}
                      className="rounded-lg border border-[var(--sa-border)] px-2 py-1 text-[11px]"
                    >
                      ویرایش
                    </Link>
                    {a.published && (
                      <Link
                        href={`/articles/${a.slug}`}
                        target="_blank"
                        className="rounded-lg border border-[var(--sa-border)] px-2 py-1 text-[11px]"
                      >
                        مشاهده
                      </Link>
                    )}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => toggle(a)}
                      className="rounded-lg border border-[var(--sa-border)] px-2 py-1 text-[11px]"
                    >
                      {a.published ? "لغو انتشار" : "انتشار"}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void remove(a)}
                      className="rounded-lg border border-red-200 px-2 py-1 text-[11px] text-red-700"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
