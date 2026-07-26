import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function resolveSqliteUrl() {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (raw.startsWith("file:")) {
    const rel = raw.replace(/^file:/, "");
    const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
    return `file:${abs.replace(/\\/g, "/")}`;
  }
  return raw;
}

function createPrisma() {
  const adapter = new PrismaLibSql({ url: resolveSqliteUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
