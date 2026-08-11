/**
 * Idempotent: creates the 3 brand SEO articles only when the Article table is empty.
 * Safe to run on production after deploy without resetting other seed data.
 */
import "dotenv/config";
import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

function resolveSqliteUrl() {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (raw.startsWith("file:")) {
    const rel = raw.replace(/^file:/, "");
    const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
    return `file:${abs.replace(/\\/g, "/")}`;
  }
  return raw;
}

const adapter = new PrismaLibSql({ url: resolveSqliteUrl() });
const prisma = new PrismaClient({ adapter });

const brandArticles = [
  {
    slug: "farsh-yaghoot-naghsh-mashhad-kojast",
    title: "فرش یاقوت نقش مشهد کجاست؟ آشنایی با برند و کارخانه",
    excerpt:
      "فرش یاقوت نقش مشهد کجاست و چرا در جستجوی فرش یاقوت مشهد و فرش یاقوت کاشان همین برند را می‌بینید؟ معرفی کارخانه در آران و بیدگل.",
    metaTitle: "فرش یاقوت نقش مشهد کجاست؟ | آران و بیدگل و کاشان",
    metaDesc:
      "آشنایی با فرش یاقوت نقش مشهد، دلیل نام برند و موقعیت کارخانه در شهرک سلیمان صباحی آران و بیدگل — قطب فرش کاشان.",
    contentHtml: `
<p>اگر «فرش یاقوت مشهد»، «فرش یاقوت کاشان» یا «فرش یاقوت آران و بیدگل» را جستجو کرده‌اید، این مطلب برای شماست.</p>
<p><strong>فرش یاقوت نقش مشهد</strong> برند تولید و فروش فرش است. بخش «نقش مشهد» در نام برند به هویت و نقوش اصیل ایرانی اشاره دارد؛ نشانی فیزیکی کارخانه در <strong>شهرک سلیمان صباحی، آران و بیدگل</strong> و در قطب فرش <strong>کاشان</strong> است.</p>
<p>برای خرید مستقیم و مشاهده طرح‌ها به <a href="/rugs">فروشگاه</a> سر بزنید یا صفحه <a href="/about">درباره ما</a> را بخوانید.</p>
`.trim(),
  },
  {
    slug: "rahnamay-kharid-farsh-700-shaneh",
    title: "راهنمای خرید فرش ۷۰۰ شانه از فرش یاقوت نقش مشهد",
    excerpt:
      "فرش ۷۰۰ شانه چه ویژگی‌هایی دارد و هنگام خرید از فرش یاقوت نقش مشهد به چه نکاتی توجه کنید؟",
    metaTitle: "راهنمای خرید فرش ۷۰۰ شانه | فرش یاقوت نقش مشهد",
    metaDesc:
      "راهنمای عملی خرید فرش ۷۰۰ شانه از فرش یاقوت نقش مشهد — تراکم، دوام، قیمت درب کارخانه و انتخاب طرح مناسب.",
    contentHtml: `
<p>فرش <strong>۷۰۰ شانه</strong> انتخاب محبوبی برای خانه‌هایی است که تعادل بین زیبایی، دوام و قیمت می‌خواهند.</p>
<p>در <strong>فرش یاقوت نقش مشهد</strong> می‌توانید طرح‌های ۷۰۰ شانه را با قیمت درب کارخانه از آران و بیدگل سفارش دهید. قبل از خرید به متراژ فضا، رنگ دکوراسیون و نوع کاربری (پذیرایی یا اتاق) توجه کنید.</p>
<p>مشاهده محصولات در <a href="/rugs?shaneh=700">فروشگاه ۷۰۰ شانه</a> و معرفی کامل برند در <a href="/about">درباره فرش یاقوت نقش مشهد</a>.</p>
`.trim(),
  },
  {
    slug: "farsh-kashan-aran-bidgol",
    title: "فرش کاشان و آران و بیدگل؛ چرا خرید از قطب فرش ایران به‌صرفه است",
    excerpt:
      "چرا خرید فرش از کاشان و آران و بیدگل — قطب فرش ایران — برای خریدار آنلاین به‌صرفه‌تر است؟",
    metaTitle: "فرش کاشان و آران و بیدگل | خرید از قطب فرش ایران",
    metaDesc:
      "مزایای خرید فرش از قطب کاشان و آران و بیدگل و نقش فرش یاقوت نقش مشهد در فروش مستقیم از کارخانه.",
    contentHtml: `
<p>منطقه <strong>کاشان</strong> و <strong>آران و بیدگل</strong> از قطب‌های شناخته‌شده تولید فرش در ایران است؛ نزدیکی به کارخانه یعنی قیمت شفاف‌تر و زنجیره تأمین کوتاه‌تر.</p>
<p><strong>فرش یاقوت نقش مشهد</strong> با کارخانه در شهرک سلیمان صباحی آران و بیدگل، خرید آنلاین با قیمت درب کارخانه را برای سراسر کشور فراهم کرده است.</p>
<p>از <a href="/rugs">فروشگاه</a> شروع کنید یا در <a href="/about">درباره ما</a> موقعیت و هویت برند را بخوانید.</p>
`.trim(),
  },
];

async function main() {
  const count = await prisma.article.count();
  if (count > 0) {
    console.log(`[seed-brand-articles] skipped — ${count} article(s) already exist`);
    return;
  }

  const now = new Date();
  for (const a of brandArticles) {
    await prisma.article.create({
      data: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        contentHtml: a.contentHtml,
        coverImage: "",
        published: true,
        publishedAt: now,
        metaTitle: a.metaTitle,
        metaDesc: a.metaDesc,
      },
    });
  }
  console.log(`[seed-brand-articles] created ${brandArticles.length} articles`);

  // Align support city fallback if still on old Tehran default
  const supportRow = await prisma.siteSetting.findUnique({ where: { key: "support" } });
  if (supportRow) {
    try {
      const support = JSON.parse(supportRow.value) as { city?: string };
      if (!support.city || support.city === "تهران") {
        support.city = "آران و بیدگل";
        await prisma.siteSetting.update({
          where: { key: "support" },
          data: { value: JSON.stringify(support) },
        });
        console.log("[seed-brand-articles] support.city → آران و بیدگل");
      }
    } catch {
      /* ignore */
    }
  }

  const footerRow = await prisma.siteSetting.findUnique({ where: { key: "footer" } });
  if (footerRow) {
    try {
      const footer = JSON.parse(footerRow.value) as { about?: string; links?: unknown };
      if (!footer.about || !footer.about.includes("نقش مشهد")) {
        footer.about =
          "فرش یاقوت نقش مشهد با تمرکز بر کیفیت بافت، تنوع طرح و قیمت درب کارخانه در آران و بیدگل (قطب فرش کاشان)، تجربه خریدی مطمئن فراهم می‌کند.";
        await prisma.siteSetting.update({
          where: { key: "footer" },
          data: { value: JSON.stringify(footer) },
        });
        console.log("[seed-brand-articles] footer.about updated");
      }
    } catch {
      /* ignore */
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
