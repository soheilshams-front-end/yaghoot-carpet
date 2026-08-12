"use client";

import { SIZES, type SizeId } from "@/lib/sizes";
import { SaCheckChip } from "@/components/SaCheckChip";

type Props = {
  value: SizeId[];
  onChange: (next: SizeId[]) => void;
};

export function AvailableSizesField({ value, onChange }: Props) {
  function toggle(id: SizeId) {
    if (value.includes(id)) {
      if (value.length <= 1) return;
      onChange(value.filter((x) => x !== id));
      return;
    }
    onChange([...value, id]);
  }

  return (
    <div className="block text-sm">
      <span className="mb-1.5 block font-medium">سایزهای فعال برای فروش</span>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((s) => (
          <SaCheckChip
            key={s.id}
            selected={value.includes(s.id)}
            onClick={() => toggle(s.id)}
          >
            {s.label} {s.hint}
          </SaCheckChip>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-[var(--sa-text-muted)]">
        مشتری فقط سایزهای انتخاب‌شده را در صفحه محصول می‌بیند.
      </p>
    </div>
  );
}
