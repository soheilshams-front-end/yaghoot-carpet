"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { saveProductFullAction } from "@/lib/admin/actions";
import type { CmsCategory } from "@/lib/cms";
import { colorFilters } from "@/data/site";
import { SaCheckChip } from "@/components/SaCheckChip";
import { SaSelect } from "@/components/SaSelect";

const SHANEH = [700, 1000, 1200, 1500];
const inputClass =
  "w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--sa-gold)]";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (productId: string) => void;
  categories?: CmsCategory[];
  presetCategoryId?: string | null;
  title?: string;
};

export function AdminQuickProduct({
  open,
  onClose,
  onSaved,
  categories = [],
  presetCategoryId = null,
  title = "افزودن سریع محصول",
}: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [shaneh, setShaneh] = useState(1200);
  const [image, setImage] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [colorTag, setColorTag] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setPrice(0);
    setShaneh(1200);
    setImage("");
    setCategoryIds(presetCategoryId ? [presetCategoryId] : []);
    setColorTag("");
    setError("");
  }, [open, presetCategoryId]);

  function toggleCat(id: string) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!image.trim()) {
      setError("عکس محصول لازم است");
      return;
    }
    if (!name.trim()) {
      setError("نام فرش لازم است");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("قیمت معتبر وارد کنید");
      return;
    }

    setError("");
    start(async () => {
      const code = `P-${Date.now().toString().slice(-6)}`;
      const ids =
        presetCategoryId && !categoryIds.includes(presetCategoryId)
          ? [...categoryIds, presetCategoryId]
          : categoryIds;

      const res = await saveProductFullAction({
        title: name.trim(),
        code,
        price,
        stock: 1,
        shaneh,
        description: "",
        image: image.trim(),
        active: true,
        colorTag: colorTag || null,
        gallery: [image.trim()],
        categoryIds: ids,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onSaved(res.id);
      onClose();
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-3 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-cream)] p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-[var(--sa-navy)]">{title}</h3>
              <button type="button" onClick={onClose} className="text-sm text-[var(--sa-text-muted)]">
                بستن
              </button>
            </div>

            <div className="space-y-3">
              <ImageUploadField label="عکس" value={image} onChange={setImage} />
              <label className="block text-sm">
                <span className="mb-1 block font-medium">نام فرش</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="مثلاً فرش نایین"
                  autoFocus
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">قیمت</span>
                  <input
                    type="number"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className={inputClass}
                    placeholder="تومان"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">شانه</span>
                  <SaSelect
                    value={String(shaneh)}
                    onChange={(v) => setShaneh(Number(v))}
                    options={SHANEH.map((s) => ({ value: String(s), label: String(s) }))}
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">رنگ</span>
                <SaSelect
                  value={colorTag}
                  onChange={setColorTag}
                  placeholder="بدون برچسب رنگ"
                  options={[
                    { value: "", label: "بدون برچسب رنگ" },
                    ...colorFilters.map((c) => ({
                      value: c.id,
                      label: c.label.replace("فرش ", ""),
                    })),
                  ]}
                />
              </label>

              {categories.length > 0 && (
                <div>
                  <p className="mb-1.5 text-sm font-medium">گروه</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => {
                      const on = categoryIds.includes(c.id);
                      return (
                        <SaCheckChip key={c.id} selected={on} onClick={() => toggleCat(c.id)}>
                          {c.title}
                        </SaCheckChip>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-[var(--sa-text-muted)]">
                کد محصول خودکار ساخته می‌شود. موجودی پیش‌فرض: ۱
              </p>

              {error && <p className="text-sm text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="h-11 w-full rounded-xl bg-[var(--sa-gold)] text-sm font-semibold disabled:opacity-50"
              >
                {pending ? "در حال ذخیره…" : "ذخیره در کاتالوگ"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
