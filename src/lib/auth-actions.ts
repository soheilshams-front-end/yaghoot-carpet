"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { isValidIranMobile, normalizePhone } from "@/lib/phone";
import { resolvePostLoginPath } from "@/lib/safe-callback-url";

const registerSchema = z
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
  const parsed = registerSchema.safeParse({
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

export type LoginResult =
  | { ok: true; role: "USER" | "ADMIN"; redirectTo: string }
  | { ok: false; error: string };

/** Server-side credentials login — avoids client CSRF/HTML parse failures. */
export async function credentialsLoginAction(
  phoneRaw: string,
  password: string,
  callbackUrl?: string | null,
): Promise<LoginResult> {
  const phone = normalizePhone(phoneRaw);
  if (!isValidIranMobile(phone) || password.length < 8) {
    return { ok: false, error: "invalid" };
  }

  try {
    await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "invalid" };
    }
    throw error;
  }

  const user = await prisma.user.findFirst({
    where: { phone },
    select: { role: true },
  });
  const role = user?.role === "ADMIN" ? "ADMIN" : "USER";
  return {
    ok: true,
    role,
    redirectTo: resolvePostLoginPath(role, callbackUrl ?? null),
  };
}
