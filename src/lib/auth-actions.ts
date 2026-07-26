"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isValidIranMobile, normalizePhone } from "@/lib/phone";

const schema = z
  .object({
    phone: z.string().min(10),
    password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
    passwordConfirm: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "رمز و تکرار آن یکسان نیست",
    path: ["passwordConfirm"],
  });

export async function registerAction(formData: FormData) {
  const parsed = schema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message;
    if (msg === "رمز و تکرار آن یکسان نیست" || msg === "رمز عبور باید حداقل ۸ کاراکتر باشد") {
      return { ok: false as const, error: msg };
    }
    return {
      ok: false as const,
      error: "اطلاعات واردشده معتبر نیست",
    };
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!isValidIranMobile(phone)) {
    return { ok: false as const, error: "شماره موبایل معتبر نیست (مثال: ۰۹۱۲۱۲۳۴۵۶۷)" };
  }

  const exists = await prisma.user.findFirst({ where: { phone } });
  if (exists) {
    return { ok: false as const, error: "این شماره قبلاً ثبت شده است" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      phone,
      passwordHash,
      role: "USER",
      name: `کاربر ${phone.slice(-4)}`,
    },
  });

  return { ok: true as const };
}
