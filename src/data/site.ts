import { img } from "@/lib/images";

export const heroLabels = [
  { id: "1", text: "تنوع بیش از ۱۵۰۰ طرح", side: "right" as const, tone: "navy" as const },
  { id: "2", text: "قیمت درب کارخانه", side: "right" as const, tone: "bone" as const },
  { id: "3", text: "ارسال رایگان", side: "right" as const, tone: "navy" as const },
  { id: "4", text: "ضمانت معتبر", side: "left" as const, tone: "navy" as const },
  { id: "5", text: "مشاوره تخصصی چیدمان", side: "left" as const, tone: "bone" as const },
  { id: "6", text: "خرید اقساطی بدون سود", side: "left" as const, tone: "navy" as const },
];

export const catalogCategories = [
  { id: "neoclassic", title: "فرش نئوکلاسیک", image: img.living2 },
  { id: "traditional", title: "فرش سنتی", image: img.rug1 },
  { id: "silk", title: "فرش تمام ابریشم", image: img.rug3 },
  { id: "classic", title: "فرش کلاسیک", image: img.rug2 },
  { id: "vintage", title: "فرش کهنه‌نما", image: img.rug4 },
  { id: "modern", title: "فرش مدرن", image: img.living1 },
  { id: "kitchen", title: "فرش آشپزخانه", image: img.kitchen },
  { id: "kids", title: "فرش کودک", image: img.kids },
];

export const colorFilters = [
  { id: "navy", label: "فرش سرمه‌ای", hex: "#1E3A5F", image: img.rug5 },
  { id: "sky", label: "فرش آبی", hex: "#5B8FA8", image: img.living6 },
  { id: "green", label: "فرش سبز", hex: "#3D6B4F", image: img.living5 },
  { id: "yellow", label: "فرش زرد", hex: "#C4A035", image: img.living4 },
  { id: "red", label: "فرش لاکی", hex: "#8B1E2D", image: img.rug1 },
  { id: "cream", label: "فرش کرم", hex: "#D4C4A8", image: img.rug3 },
  { id: "beige", label: "فرش نسکافه‌ای", hex: "#A89070", image: img.living3 },
  { id: "gray", label: "فرش طوسی", hex: "#8A9099", image: img.living1 },
  { id: "black", label: "فرش مشکی", hex: "#1A1A1A", image: img.rug4 },
  { id: "brown", label: "فرش موکا", hex: "#5C4033", image: img.rug5 },
];

export const faqs = [
  {
    q: "چگونه سفارش ثبت می‌شود؟",
    a: "از طریق وبسایت، اینستاگرام یا واتساپ سفارش ثبت کنید. پیگیری از داشبورد خریدار ممکن است.",
  },
  {
    q: "هزینه ارسال چگونه محاسبه می‌شود؟",
    a: "در خریدهای نقدی بالای مبلغ مشخص، ارسال به سراسر کشور رایگان است.",
  },
  {
    q: "آیا شرایط خرید اقساطی دارید؟",
    a: "بله؛ اقساط بدون سود برای طرح‌های منتخب. جزئیات را از مشاوران بپرسید.",
  },
  {
    q: "آیا فرش‌های یاقوت گارانتی دارند؟",
    a: "بله، تمامی فرش‌ها ۵ سال ضمانت معتبر دارند.",
  },
  {
    q: "آیا مشاوره تخصصی چیدمان ارائه می‌دهید؟",
    a: "بله؛ کارشناسان ما برای انتخاب بهترین طرح و رنگ کنار شما هستند.",
  },
];

export const guarantees = [
  {
    title: "تحویل رایگان",
    desc: "ارسال سریع به سراسر کشور",
    icon: "truck",
    image: img.living4,
  },
  {
    title: "مشاوره قبل از خرید",
    desc: "همراهی متخصصان چیدمان",
    icon: "chat",
    image: img.living2,
  },
  {
    title: "ضمانت بهترین کیفیت",
    desc: "۵ سال ضمانت معتبر",
    icon: "shield",
    image: img.rug1,
  },
  {
    title: "تضمین بهترین قیمت",
    desc: "قیمت درب کارخانه",
    icon: "tag",
    image: img.rug2,
  },
];

export const footerLinks = {
  quick: [
    { href: "/", label: "صفحه اصلی" },
    { href: "/rugs", label: "فروشگاه" },
    { href: "/articles", label: "مقالات" },
    { href: "/about", label: "درباره ما" },
    { href: "/dashboard", label: "داشبورد" },
  ],
  cats: [
    { href: "/rugs?collection=classic", label: "فرش کلاسیک" },
    { href: "/rugs?collection=modern", label: "فرش مدرن" },
    { href: "/rugs?collection=silk", label: "فرش تمام ابریشم" },
    { href: "/rugs?collection=classic", label: "فرش نئوکلاسیک" },
    { href: "/rugs?collection=modern", label: "فرش کهنه‌نما" },
  ],
};

export const heroImage = img.hero;
