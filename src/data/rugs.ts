import { img } from "@/lib/images";
import type { SizeId } from "@/lib/sizes";
import { ALL_SIZE_IDS } from "@/lib/sizes";

export type Rug = {
  id: string;
  title: string;
  code: string;
  price: number;
  shaneh: number;
  /** Primary category slug (free-form from CMS) */
  collection: string;
  image: string;
  /** Kept for API compat; inventory unused — always treat as available */
  stock: number;
  description: string;
  /** ISO date — used for newest sort when present */
  createdAt?: string;
  /** Gallery URLs; falls back to [image] on PDP */
  gallery?: string[];
  /** Color filter id from homepage color explorer */
  colorTag?: string | null;
  /** Size ids offered for this product */
  availableSizes?: SizeId[];
};

/** Shop filter chips — brand label «یاقوت» is not a product collection */
export const categories = [
  { id: "classic", title: "کلاسیک", image: img.rug1 },
  { id: "modern", title: "مدرن", image: img.living2 },
  { id: "silk", title: "ابریشم", image: img.rug3 },
] as const;

export const rugs: Rug[] = [
  {
    id: "1",
    title: "فرش تمام ابریشم لاکی",
    code: "۲۴۱",
    price: 370_000_000,
    shaneh: 1500,
    collection: "silk",
    image: img.rug1,
    stock: 9999,
    availableSizes: [...ALL_SIZE_IDS],
    description: "فرش ابریشم با نقوش سنتی، رنگ‌بندی لاکی و حاشیه سرمه‌ای.",
  },
  {
    id: "2",
    title: "فرش کلاسیک نایین",
    code: "۱۸۸",
    price: 184_000_000,
    shaneh: 1200,
    collection: "classic",
    image: img.rug2,
    stock: 9999,
    availableSizes: [...ALL_SIZE_IDS],
    description: "طرح سنتی نایین با بافت متراکم و زمینه گرم.",
  },
  {
    id: "3",
    title: "فرش مدرن هندسی",
    code: "۳۱۲",
    price: 96_000_000,
    shaneh: 1000,
    collection: "modern",
    image: img.living1,
    stock: 9999,
    availableSizes: [...ALL_SIZE_IDS],
    description: "ترکیب خطوط معاصر با حس لوکس سرمه‌ای و طلایی.",
  },
  {
    id: "4",
    title: "فرش یاقوت تبریز",
    code: "۰۷۵",
    price: 420_000_000,
    shaneh: 1500,
    collection: "classic",
    image: img.rug4,
    stock: 9999,
    availableSizes: [...ALL_SIZE_IDS],
    description: "مدالیون مرکزی یاقوت و حاشیه چندلایه.",
  },
  {
    id: "5",
    title: "فرش ابریشم کاشان",
    code: "۴۵۶",
    price: 312_000_000,
    shaneh: 1200,
    collection: "silk",
    image: img.rug5,
    stock: 9999,
    availableSizes: [...ALL_SIZE_IDS],
    description: "بافت ابریشمی لطیف با درخشش طبیعی.",
  },
  {
    id: "6",
    title: "فرش ۷۰۰ شانه اقتصادی",
    code: "۵۰۱",
    price: 56_000_000,
    shaneh: 700,
    collection: "modern",
    image: img.living3,
    stock: 9999,
    availableSizes: [...ALL_SIZE_IDS],
    description: "گزینه مناسب برای فضاهای روزمره.",
  },
  {
    id: "7",
    title: "فرش نئوکلاسیک کرم",
    code: "۶۱۸",
    price: 148_000_000,
    shaneh: 1200,
    collection: "classic",
    image: img.living4,
    stock: 9999,
    availableSizes: [...ALL_SIZE_IDS],
    description: "طرح نئوکلاسیک گرم برای پذیرایی.",
  },
  {
    id: "8",
    title: "فرش کهنه‌نما لاکی",
    code: "۷۰۲",
    price: 132_000_000,
    shaneh: 1000,
    collection: "modern",
    image: img.living5,
    stock: 9999,
    availableSizes: [...ALL_SIZE_IDS],
    description: "حال‌وهوای کهنه‌نما با رنگ‌های عمیق.",
  },
  {
    id: "9",
    title: "فرش ابریشم قم",
    code: "۸۳۰",
    price: 396_000_000,
    shaneh: 1500,
    collection: "silk",
    image: img.rug3,
    stock: 9999,
    availableSizes: [...ALL_SIZE_IDS],
    description: "ابریشم قم با جزئیات ظریف و رنگ‌های اشرافی.",
  },
];

export function formatPrice(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

export function collectionLabel(id: Rug["collection"] | string) {
  const map: Record<string, string> = {
    classic: "کلاسیک",
    modern: "مدرن",
    silk: "ابریشم",
  };
  return map[id] ?? categories.find((c) => c.id === id)?.title ?? id;
}

export function shanehMeta(shaneh: number) {
  if (shaneh >= 1500) {
    return { density: "فوق‌متراکم", knots: "حدود ۴۵۰٬۰۰۰ گره در مترمربع", feel: "لوکس و ظریف" };
  }
  if (shaneh >= 1200) {
    return { density: "متراکم", knots: "حدود ۳۶۰٬۰۰۰ گره در مترمربع", feel: "جزئیات واضح و بافت محکم" };
  }
  if (shaneh >= 1000) {
    return { density: "متعادل", knots: "حدود ۳۰۰٬۰۰۰ گره در مترمربع", feel: "تعادل زیبایی و دوام" };
  }
  return { density: "اقتصادی", knots: "حدود ۲۱۰٬۰۰۰ گره در مترمربع", feel: "مناسب استفاده روزمره" };
}
