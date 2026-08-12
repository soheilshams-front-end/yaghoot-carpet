"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AvailableSizesField } from "@/components/admin/AvailableSizesField";
import { saveProductFullAction } from "@/lib/admin/actions";
import type { CmsCategory } from "@/lib/cms";
import type { ColorFilterItem, ShanehFilterItem } from "@/lib/filters";
import { SaCheckChip } from "@/components/SaCheckChip";
import { SaSelect } from "@/components/SaSelect";
import { TomanPriceInput } from "@/components/admin/TomanPriceInput";
import { ALL_SIZE_IDS, type SizeId } from "@/lib/sizes";

const inputClass =
  "w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--sa-gold)]";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (productId: string) => void;
  categories?: CmsCategory[];
  presetCategoryId?: string | null;
  title?: string;
  shanehOptions?: ShanehFilterItem[];
  colorOptions?: ColorFilterItem[];
};

export function AdminQuickProduct({
  open,
  onClose,
  onSaved,
  categories = [],
  presetCategoryId = null,
  title = "افزودن سریع محصول",
  shanehOptions = [],
  colorOptions = [],
}: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [shaneh, setShaneh] = useState(1200);
  const [density, setDensity] = useState(0);
  const [image, setImage] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [colorTag, setColorTag] = useState("");
  const [availableSizes, setAvailableSizes] = useState<SizeId[]>([...ALL_SIZE_IDS]);

  const shanehSelect = shanehOptions.length
    ? shanehOptions
    : [{ shaneh: 700 }, { shaneh: 1000 }, { shaneh: 1200 }, { shaneh: 1500 }];

  useEffect(() => {
    if (!open) return;
    setName("");
    setPrice(0);
    setShaneh(shanehSelect[0]?.shaneh ?? 1200);
    setDensity(0);
    setImage("");
    setCategoryIds(presetCategoryId ? [presetCategoryId] : []);
    setColorTag("");
    setAvailableSizes([...ALL_SIZE_IDS]);
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
    if (!availableSizes.length) {
      setError("حداقل یک سایز فعال انتخاب کنید");
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
        shaneh,
        density,
        description: "",
        image: image.trim(),
        active: true,
        colorTag: colorTag || null,
        gallery: [image.trim()],
        categoryIds: ids,
        availableSizes,
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
                <TomanPriceInput value={price} onChange={setPrice} className={inputClass} />
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">شانه</span>
                  <SaSelect
                    value={String(shaneh)}
                    onChange={(v) => setShaneh(Number(v))}
                    options={shanehSelect.map((s) => ({
                      value: String(s.shaneh),
                      label: String(s.shaneh),
                    }))}
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">تراکم (عدد)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={density || ""}
                  onChange={(e) => setDensity(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                  placeholder="مثلاً ۳۶۰۰"
                  className={inputClass}
                />
              </label>
              <AvailableSizesField value={availableSizes} onChange={setAvailableSizes} />
              <label className="block text-sm">
                <span className="mb-1 block font-medium">رنگ</span>
                <SaSelect
                  value={colorTag}
                  onChange={setColorTag}
                  placeholder="بدون برچسب رنگ"
                  options={[
                    { value: "", label: "بدون برچسب رنگ" },
                    ...colorOptions.map((c) => ({
                      value: c.id,
                      label: c.label.replace(/^فرش\s+/, ""),
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
