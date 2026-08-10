"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SaCheckbox } from "@/components/SaCheckbox";
import { saveArticleAction } from "@/lib/admin/actions";
import { adminHref } from "@/lib/admin-path";
import type { CmsArticle } from "@/lib/cms";
import { slugify } from "@/lib/slug";

type Props = {
  article?: CmsArticle | null;
};

export function AdminArticleForm({ article }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [contentHtml, setContentHtml] = useState(article?.contentHtml ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [published, setPublished] = useState(article?.published ?? false);
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(article?.metaDesc ?? "");

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveArticleAction({
        id: article?.id,
        title,
        slug: slug || undefined,
        excerpt,
        contentHtml,
        coverImage,
        published,
        metaTitle,
        metaDesc,
      });
      if (!res.ok) {
        setMsg(res.error);
        return;
      }
      setMsg("مقاله ذخیره شد");
      router.push(adminHref("/articles"));
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--sa-navy)]">
            {article ? "ویرایش مقاله" : "مقاله جدید"}
          </h2>
          <p className="mt-1 text-xs text-[var(--sa-text-muted)]">
            عنوان، لینک (اسلاگ)، خلاصه و محتوای کامل برای سئو
          </p>
        </div>
        <Link
          href={adminHref("/articles")}
          className="rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2 text-xs text-[var(--sa-navy)]"
        >
          بازگشت به لیست
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--sa-navy)]">عنوان</span>
          <input
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sa-gold)]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--sa-navy)]">اسلاگ (لینک)</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            dir="ltr"
            className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sa-gold)]"
            placeholder="my-article-slug"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--sa-navy)]">خلاصه</span>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          maxLength={300}
          className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sa-gold)]"
        />
      </label>

      <ImageUploadField value={coverImage} onChange={setCoverImage} label="تصویر کاور" />

      <RichTextEditor value={contentHtml} onChange={setContentHtml} />

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--sa-navy)]">عنوان سئو (اختیاری)</span>
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            maxLength={180}
            className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sa-gold)]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--sa-navy)]">توضیح سئو (اختیاری)</span>
          <input
            value={metaDesc}
            onChange={(e) => setMetaDesc(e.target.value)}
            maxLength={300}
            className="w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sa-gold)]"
          />
        </label>
      </div>

      <SaCheckbox checked={published} onChange={setPublished} label="منتشر شود" />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[var(--sa-navy)] px-5 py-2.5 text-sm font-semibold text-[var(--sa-text-on-navy)] disabled:opacity-60"
        >
          {pending ? "در حال ذخیره…" : "ذخیره مقاله"}
        </button>
        {msg && <p className="text-sm text-[var(--sa-navy)]">{msg}</p>}
      </div>
    </form>
  );
}
