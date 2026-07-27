import { img } from "@/lib/images";

export type Rug = {
  id: string;
  title: string;
  code: string;
  price: number;
  shaneh: 700 | 1000 | 1200 | 1500;
  /** Primary category slug (free-form from CMS) */
  collection: string;
  image: string;
  stock: number;
  description: string;
  /** ISO date — used for newest sort when present */
  createdAt?: string;
  /** Gallery URLs; falls back to [image] on PDP */
  gallery?: string[];
  /** Color filter id from homepage color explorer */
  colorTag?: string | null;
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
    price: 185_000_000,
    shaneh: 1500,
    collection: "silk",
    image: img.rug1,
    stock: 3,
    description: "فرش ابریشم با نقوش سنتی، رنگ‌بندی لاکی و حاشیه سرمه‌ای.",
  },
  {
    id: "2",
    title: "فرش کلاسیک نایین",
    code: "۱۸۸",
    price: 92_000_000,
    shaneh: 1200,
    collection: "classic",
    image: img.rug2,
    stock: 5,
    description: "طرح سنتی نایین با بافت متراکم و زمینه گرم.",
  },
  {
    id: "3",
    title: "فرش مدرن هندسی",
    code: "۳۱۲",
    price: 48_000_000,
    shaneh: 1000,
    collection: "modern",
    image: img.living1,
    stock: 8,
    description: "ترکیب خطوط معاصر با حس لوکس سرمه‌ای و طلایی.",
  },
  {
    id: "4",
    title: "فرش یاقوت تبریز",
    code: "۰۷۵",
    price: 210_000_000,
    shaneh: 1500,
    collection: "classic",
    image: img.rug4,
    stock: 2,
    description: "مدالیون مرکزی یاقوت و حاشیه چندلایه.",
  },
  {
    id: "5",
    title: "فرش ابریشم کاشان",
    code: "۴۵۶",
    price: 156_000_000,
    shaneh: 1200,
    collection: "silk",
    image: img.rug5,
    stock: 4,
    description: "بافت ابریشمی لطیف با درخشش طبیعی.",
  },
  {
    id: "6",
    title: "فرش ۷۰۰ شانه اقتصادی",
    code: "۵۰۱",
    price: 28_000_000,
    shaneh: 700,
    collection: "modern",
    image: img.living3,
    stock: 12,
    description: "گزینه مناسب برای فضاهای روزمره.",
  },
  {
    id: "7",
    title: "فرش نئوکلاسیک کرم",
    code: "۶۱۸",
    price: 74_000_000,
    shaneh: 1200,
    collection: "classic",
    image: img.living4,
    stock: 6,
    description: "طرح نئوکلاسیک گرم برای پذیرایی.",
  },
  {
    id: "8",
    title: "فرش کهنه‌نما لاکی",
    code: "۷۰۲",
    price: 66_000_000,
    shaneh: 1000,
    collection: "modern",
    image: img.living5,
    stock: 7,
    description: "حال‌وهوای کهنه‌نما با رنگ‌های عمیق.",
  },
  {
    id: "9",
    title: "فرش ابریشم قم",
    code: "۸۳۰",
    price: 198_000_000,
    shaneh: 1500,
    collection: "silk",
    image: img.rug3,
    stock: 2,
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

export function shanehMeta(shaneh: Rug["shaneh"]) {
  const map = {
    700: { density: "اقتصادی", knots: "حدود ۲۱۰٬۰۰۰ گره در مترمربع", feel: "مناسب استفاده روزمره" },
    1000: { density: "متعادل", knots: "حدود ۳۰۰٬۰۰۰ گره در مترمربع", feel: "تعادل زیبایی و دوام" },
    1200: { density: "متراکم", knots: "حدود ۳۶۰٬۰۰۰ گره در مترمربع", feel: "جزئیات واضح و بافت محکم" },
    1500: { density: "فوق‌متراکم", knots: "حدود ۴۵۰٬۰۰۰ گره در مترمربع", feel: "لوکس و ظریف" },
  } as const;
  return map[shaneh];
}
