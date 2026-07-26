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
          showInShop: ["classic", "modern", "silk"].includes(c.id),
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
      city: "تهران",
    },
    footer: {
      about:
        "مجموعه فرش یاقوت با تمرکز بر کیفیت بافت، تنوع طرح و قیمت درب کارخانه، تجربه خریدی مطمئن فراهم می‌کند.",
      links: footerLinks,
    },
    hero: {
      eyebrow: "فروشگاه آنلاین",
      headline: "به سبک فرش یاقوت",
    },
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(value) },
      update: { value: JSON.stringify(value) },
    });
  }

  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("user123", 10);

  const adminPhone = "09122988166";
  const existingAdmin = await prisma.user.findFirst({ where: { phone: adminPhone } });
  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { passwordHash: adminHash, role: "ADMIN", phone: adminPhone },
    });
  } else {
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
  }

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
