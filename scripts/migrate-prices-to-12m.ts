/**
 * One-time: multiply Product.price by 2 after switching base from ۲×۳ to ۳×۴ (۱۲ متری).
 * Run once: npm run db:migrate-prices-12m
 * Do not run twice — it would double prices again.
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

async function main() {
  const before = await prisma.product.findMany({
    select: { id: true, code: true, price: true },
  });
  if (before.length === 0) {
    console.log("No products to update.");
    return;
  }

  const result = await prisma.product.updateMany({
    data: { price: { multiply: 2 } },
  });

  console.log(`Updated ${result.count} product(s): price *= 2 (۲×۳ base → ۱۲ متری / ۳×۴).`);
  for (const p of before.slice(0, 10)) {
    console.log(`  ${p.code}: ${p.price} → ${p.price * 2}`);
  }
  if (before.length > 10) {
    console.log(`  … and ${before.length - 10} more`);
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
