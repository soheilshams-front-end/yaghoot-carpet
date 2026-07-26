export const SIZES = [
  { id: "2x3", label: "۲ × ۳", hint: "متر", factor: 1 },
  { id: "2.5x3.5", label: "۲٫۵ × ۳٫۵", hint: "متر", factor: 1.45 },
  { id: "3x4", label: "۳ × ۴", hint: "متر", factor: 2 },
  { id: "4x6", label: "۴ × ۶", hint: "متر", factor: 4 },
] as const;

export type SizeId = (typeof SIZES)[number]["id"];

export function resolveSize(sizeId: string) {
  return SIZES.find((s) => s.id === sizeId) ?? null;
}
