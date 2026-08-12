import { prisma } from "@/lib/db";
import { colorFilters as defaultColorFilters } from "@/data/site";
import { img } from "@/lib/images";

export type ShanehFilterItem = {
  shaneh: number;
  image: string;
  hint?: string;
  label?: string;
};

export type ColorFilterItem = {
  id: string;
  label: string;
  hex: string;
  image: string;
};

export const DEFAULT_SHANEH_FILTERS: ShanehFilterItem[] = [
  { shaneh: 1500, image: img.shaneh1500, hint: "تراکم لوکس", label: "۱۵۰۰ شانه" },
  { shaneh: 1200, image: img.shaneh1200, hint: "جزئیات ظریف", label: "۱۲۰۰ شانه" },
  { shaneh: 1000, image: img.shaneh1000, hint: "تعادل کیفیت", label: "۱۰۰۰ شانه" },
  { shaneh: 700, image: img.shaneh700, hint: "اقتصادی روزمره", label: "۷۰۰ شانه" },
];

export const DEFAULT_COLOR_FILTERS: ColorFilterItem[] = defaultColorFilters.map((c) => ({
  id: c.id,
  label: c.label,
  hex: c.hex,
  image: c.image,
}));

function parseShanehItems(raw: unknown): ShanehFilterItem[] | null {
  if (!Array.isArray(raw) || !raw.length) return null;
  const items: ShanehFilterItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const shaneh = Number(r.shaneh);
    const image = String(r.image ?? "").trim();
    if (!Number.isFinite(shaneh) || shaneh < 20 || shaneh > 5000 || !image) continue;
    items.push({
      shaneh: Math.round(shaneh),
      image,
      hint: typeof r.hint === "string" ? r.hint : undefined,
      label: typeof r.label === "string" ? r.label : undefined,
    });
  }
  return items.length ? items : null;
}

function parseColorItems(raw: unknown): ColorFilterItem[] | null {
  if (!Array.isArray(raw) || !raw.length) return null;
  const items: ColorFilterItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id = String(r.id ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    const label = String(r.label ?? "").trim();
    const hex = String(r.hex ?? "").trim();
    const image = String(r.image ?? "").trim();
    if (!id || !label || !hex || !image) continue;
    items.push({ id, label, hex, image });
  }
  return items.length ? items : null;
}

export async function getShanehFilters(): Promise<ShanehFilterItem[]> {
  const section = await prisma.homepageSection.findUnique({ where: { key: "shaneh" } });
  if (!section?.payload) return DEFAULT_SHANEH_FILTERS;
  try {
    const payload = JSON.parse(section.payload) as { items?: unknown };
    return parseShanehItems(payload.items) ?? DEFAULT_SHANEH_FILTERS;
  } catch {
    return DEFAULT_SHANEH_FILTERS;
  }
}

export async function getColorFilters(): Promise<ColorFilterItem[]> {
  const section = await prisma.homepageSection.findUnique({ where: { key: "colors" } });
  if (!section?.payload) return DEFAULT_COLOR_FILTERS;
  try {
    const payload = JSON.parse(section.payload) as { items?: unknown };
    return parseColorItems(payload.items) ?? DEFAULT_COLOR_FILTERS;
  } catch {
    return DEFAULT_COLOR_FILTERS;
  }
}

export async function getShopFilterTaxonomy() {
  const [shaneh, colors] = await Promise.all([getShanehFilters(), getColorFilters()]);
  return { shaneh, colors };
}

/** Always-in-stock sentinel written on create/update (DB column kept). */
export const CATALOG_STOCK = 9999;
