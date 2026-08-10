"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";

type Props = {
  value: string;
  onChange: (html: string) => void;
  label?: string;
};

export function RichTextEditor({ value, onChange, label = "محتوا" }: Props) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        dir: "rtl",
        class:
          "sa-prose min-h-[220px] max-w-none px-3 py-3 text-sm outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== editor.getText()) {
      // Only sync when external value meaningfully differs (e.g. load edit form)
      if (!editor.isFocused) {
        editor.commands.setContent(value || "", { emitUpdate: false });
      }
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("آدرس لینک (https://…)", prev || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  const uploadImage = useCallback(
    async (file: File | null) => {
      if (!file || !editor) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
        if (!data.ok || !data.url) throw new Error(data.error || "آپلود ناموفق");
        editor.chain().focus().setImage({ src: data.url, alt: "" }).run();
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "خطا در آپلود");
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  if (!editor) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--sa-navy)]">{label}</label>
        <div className="rounded-xl border border-[var(--sa-border)] bg-white px-3 py-8 text-center text-sm text-[var(--sa-text-muted)]">
          در حال آماده‌سازی ادیتور…
        </div>
      </div>
    );
  }

  const btn = (active: boolean) =>
    `rounded-lg px-2.5 py-1 text-xs ${
      active
        ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
        : "bg-white text-[var(--sa-navy)] ring-1 ring-[var(--sa-border)] hover:bg-[var(--sa-cream)]"
    }`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--sa-navy)]">{label}</label>
      <div className="overflow-hidden rounded-xl border border-[var(--sa-border)] bg-white">
        <div className="flex flex-wrap gap-1.5 border-b border-[var(--sa-border)] bg-[var(--sa-bg)] p-2">
          <button
            type="button"
            className={btn(editor.isActive("bold"))}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            ضخیم
          </button>
          <button
            type="button"
            className={btn(editor.isActive("italic"))}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            کج
          </button>
          <button
            type="button"
            className={btn(editor.isActive("heading", { level: 2 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </button>
          <button
            type="button"
            className={btn(editor.isActive("heading", { level: 3 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </button>
          <button
            type="button"
            className={btn(editor.isActive("bulletList"))}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            لیست
          </button>
          <button
            type="button"
            className={btn(editor.isActive("orderedList"))}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            شماره‌دار
          </button>
          <button
            type="button"
            className={btn(editor.isActive("blockquote"))}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            نقل‌قول
          </button>
          <button type="button" className={btn(editor.isActive("link"))} onClick={setLink}>
            لینک
          </button>
          <label className={`${btn(false)} cursor-pointer`}>
            {uploading ? "آپلود…" : "تصویر"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => void uploadImage(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
