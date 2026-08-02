import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const url = `file:${path.join(root, "prisma", "dev.db").replace(/\\/g, "/")}`;
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url }) });

const uh = await bcrypt.hash("user12345", 10);
const ah = await bcrypt.hash("QaAdmin123!", 10);

const u = await prisma.user.updateMany({
  where: { phone: "09120000000" },
  data: { passwordHash: uh, role: "USER" },
});
const a = await prisma.user.updateMany({
  where: { phone: "09124496001" },
  data: { passwordHash: ah, role: "ADMIN" },
});

const users = await prisma.user.findMany({
  select: { phone: true, role: true, email: true, name: true },
});
console.log(JSON.stringify({ userUpdated: u.count, adminUpdated: a.count, users }, null, 2));
await prisma.$disconnect();
