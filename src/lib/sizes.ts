export const SIZES = [
  { id: "2x3", label: "۲ × ۳", hint: "متر", factor: 0.5 },
  { id: "2.5x3.5", label: "۲٫۵ × ۳٫۵", hint: "متر", factor: 8.75 / 12 },
  { id: "3x4", label: "۳ × ۴", hint: "متر", factor: 1 },
  { id: "4x6", label: "۴ × ۶", hint: "متر", factor: 2 },
] as const;

export type SizeId = (typeof SIZES)[number]["id"];

/** Catalog / admin base size: ۱۲ متری (۳×۴) */
export const BASE_SIZE_ID: SizeId = "3x4";

export const ALL_SIZE_IDS: SizeId[] = SIZES.map((s) => s.id);

const SIZE_ID_SET = new Set<string>(ALL_SIZE_IDS);

export function resolveSize(sizeId: string) {
  return SIZES.find((s) => s.id === sizeId) ?? null;
}

/** قیمت سایز انتخابی از روی قیمت پایه ۱۲ متری */
export function priceForSize(base12m: number, sizeId: string) {
  const size = resolveSize(sizeId);
  if (!size) return Math.round(base12m);
  return Math.round(base12m * size.factor);
}

export function parseAvailableSizes(raw: string | null | undefined): SizeId[] {
  if (!raw?.trim()) return [...ALL_SIZE_IDS];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...ALL_SIZE_IDS];
    const ids = parsed.filter((x): x is SizeId => typeof x === "string" && SIZE_ID_SET.has(x));
    return ids.length ? [...new Set(ids)] : [...ALL_SIZE_IDS];
  } catch {
    return [...ALL_SIZE_IDS];
  }
}

export function serializeAvailableSizes(ids: string[]): string {
  const valid = ids.filter((x): x is SizeId => SIZE_ID_SET.has(x));
  const unique = [...new Set(valid)];
  return JSON.stringify(unique.length ? unique : ALL_SIZE_IDS);
}

export function sizesForProduct(availableSizes: SizeId[] | undefined) {
  const ids = availableSizes?.length ? availableSizes : ALL_SIZE_IDS;
  const set = new Set(ids);
  const list = SIZES.filter((s) => set.has(s.id));
  return list.length ? list : [...SIZES];
}

export function defaultSizeId(availableSizes: SizeId[] | undefined): SizeId {
  const list = sizesForProduct(availableSizes);
  return list.find((s) => s.id === BASE_SIZE_ID)?.id ?? list[0]!.id;
}
