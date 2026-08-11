import "dotenv/config";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { rugs } from "../src/data/rugs";
import {
  catalogCategories,
  colorFilters,
  faqs,
  guarantees,
  heroImage,
  heroLabels,
  footerLinks,
} from "../src/data/site";
import { img } from "../src/lib/images";

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

const shopCategories = [
  { slug: "classic", title: "کلاسیک", image: img.rug1, sortOrder: 1 },
  { slug: "modern", title: "مدرن", image: img.living2, sortOrder: 2 },
  { slug: "silk", title: "ابریشم", image: img.rug3, sortOrder: 3 },
];

async function main() {
  // Categories: shop filters + home catalog
  for (const c of shopCategories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        title: c.title,
        image: c.image,
        sortOrder: c.sortOrder,
        showInHome: false,
        showInShop: true,
        active: true,
      },
      update: {
        title: c.title,
        image: c.image,
        sortOrder: c.sortOrder,
        showInShop: true,
      },
    });
  }

  for (const [i, c] of catalogCategories.entries()) {
    const existing = await prisma.category.findUnique({ where: { slug: c.id } });
    if (existing) {
      await prisma.category.update({
        where: { slug: c.id },
        data: {
          title: c.title,
          image: c.image,
          sortOrder: 10 + i,
          showInHome: true,
          showInShop: true,
          active: true,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          slug: c.id,
          title: c.title,
          image: c.image,
          sortOrder: 10 + i,
          showInHome: true,
          showInShop: true,
          active: true,
        },
      });
    }
  }

  const allCats = await prisma.category.findMany();
  const catBySlug = Object.fromEntries(allCats.map((c) => [c.slug, c]));

  for (const rug of rugs) {
    await prisma.product.upsert({
      where: { id: rug.id },
      create: {
        id: rug.id,
        title: rug.title,
        code: rug.code,
        price: rug.price,
        shaneh: rug.shaneh,
        collection: rug.collection,
        image: rug.image,
        stock: rug.stock,
        description: rug.description,
        active: true,
      },
      update: {
        title: rug.title,
        code: rug.code,
        price: rug.price,
        shaneh: rug.shaneh,
        collection: rug.collection,
        image: rug.image,
        stock: rug.stock,
        description: rug.description,
        active: true,
      },
    });

    const primary = catBySlug[rug.collection];
    if (primary) {
      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: { productId: rug.id, categoryId: primary.id },
        },
        create: { productId: rug.id, categoryId: primary.id },
        update: {},
      });
    }

    const imgCount = await prisma.productImage.count({ where: { productId: rug.id } });
    if (imgCount === 0) {
      await prisma.productImage.create({
        data: { productId: rug.id, url: rug.image, sortOrder: 0 },
      });
    }
  }

  const sections: {
    key: string;
    title: string;
    sortOrder: number;
    payload: unknown;
  }[] = [
    {
      key: "hero",
      title: "هیرو",
      sortOrder: 0,
      payload: { image: heroImage, labels: heroLabels },
    },
    {
      key: "categories",
      title: "دسته‌بندی‌ها",
      sortOrder: 1,
      payload: {},
    },
    {
      key: "newest",
      title: "جدیدترین‌ها",
      sortOrder: 2,
      payload: {},
    },
    {
      key: "popular",
      title: "محبوب‌ترین‌ها",
      sortOrder: 3,
      payload: { title: "محبوب‌ترین فرش‌های ما" },
    },
    {
      key: "shaneh",
      title: "فیلتر شانه",
      sortOrder: 4,
      payload: {
        items: [
          { shaneh: 1500, image: img.shaneh1500, label: "۱۵۰۰ شانه" },
          { shaneh: 1200, image: img.shaneh1200, label: "۱۲۰۰ شانه" },
          { shaneh: 1000, image: img.shaneh1000, label: "۱۰۰۰ شانه" },
          { shaneh: 700, image: img.shaneh700, label: "۷۰۰ شانه" },
        ],
      },
    },
    {
      key: "colors",
      title: "فیلتر رنگ",
      sortOrder: 5,
      payload: { items: colorFilters },
    },
    {
      key: "silk",
      title: "ابریشم",
      sortOrder: 6,
      payload: {},
    },
    {
      key: "guarantees",
      title: "ضمانت‌ها",
      sortOrder: 7,
      payload: { items: guarantees },
    },
    {
      key: "faq",
      title: "سوالات متداول",
      sortOrder: 8,
      payload: { items: faqs },
    },
  ];

  for (const s of sections) {
    await prisma.homepageSection.upsert({
      where: { key: s.key },
      create: {
        key: s.key,
        title: s.title,
        enabled: true,
        sortOrder: s.sortOrder,
        payload: JSON.stringify(s.payload),
      },
      update: {
        title: s.title,
        sortOrder: s.sortOrder,
        payload: JSON.stringify(s.payload),
      },
    });
  }

  const settings: Record<string, unknown> = {
    support: {
      phone: "09124496001",
      phoneDisplay: "۰۹۱۲۴۴۹۶۰۰۱",
      city: "آران و بیدگل",
    },
    footer: {
      about:
        "فرش یاقوت نقش مشهد با تمرکز بر کیفیت بافت، تنوع طرح و قیمت درب کارخانه در آران و بیدگل (قطب فرش کاشان)، تجربه خریدی مطمئن فراهم می‌کند.",
      links: footerLinks,
    },
    hero: {
      eyebrow: "",
      headline: "فرش یاقوت نقش مشهد",
    },
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(value) },
      update: { value: JSON.stringify(value) },
    });
  }

  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    const now = new Date();
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
    console.log(`[seed] Created ${brandArticles.length} brand articles`);
  }

  const adminPhone = process.env.ADMIN_PHONE?.trim() || "09124496001";
  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();
    if (!adminPassword || adminPassword.length < 8) {
      console.warn(
        "[seed] No admin user found. Set ADMIN_INITIAL_PASSWORD (min 8 chars) to create the first admin.",
      );
    } else {
      const adminHash = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: {
          email: "admin@yaghoot.local",
          name: "مدیر یاقوت",
          phone: adminPhone,
          city: "تهران",
          passwordHash: adminHash,
          role: "ADMIN",
        },
      });
      console.log(`[seed] Admin user created with phone ${adminPhone}`);
    }
  }

  const userHash = await bcrypt.hash("user12345", 10);
  const userPhone = "09120000000";
  let demoUser = await prisma.user.findFirst({ where: { phone: userPhone } });
  if (demoUser) {
    demoUser = await prisma.user.update({
      where: { id: demoUser.id },
      data: { passwordHash: userHash, name: "سهیل رضایی", phone: userPhone },
    });
  } else {
    demoUser = await prisma.user.create({
      data: {
        email: "user@yaghoot.local",
        name: "سهیل رضایی",
        phone: userPhone,
        city: "",
        address: "",
        passwordHash: userHash,
        role: "USER",
      },
    });
  }

  for (const productId of ["2", "4", "5"]) {
    await prisma.wishlistItem.upsert({
      where: {
        userId_productId: { userId: demoUser.id, productId },
      },
      create: { userId: demoUser.id, productId },
      update: {},
    });
  }

  console.log("Seeded products, categories, homepage sections, settings, accounts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
