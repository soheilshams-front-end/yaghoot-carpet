import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";
import type { AppRole } from "@/auth.config";
import { isValidIranMobile, normalizePhone } from "@/lib/phone";

declare module "next-auth" {
  interface User {
    role: AppRole;
    phone?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email?: string | null;
      phone?: string | null;
      name?: string | null;
      role: AppRole;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    phone?: string | null;
    roleCheckedAt?: number;
  }
}

const credentialsSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(8),
});

const ROLE_REFRESH_MS = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: AppRole }).role;
        token.phone = (user as { phone?: string | null }).phone ?? null;
        token.roleCheckedAt = Date.now();
      }

      const checkedAt = (token.roleCheckedAt as number | undefined) ?? 0;
      if (
        token.id &&
        (trigger === "update" || Date.now() - checkedAt > ROLE_REFRESH_MS)
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
        token.roleCheckedAt = Date.now();
      }

      return token;
    },
    session: authConfig.callbacks.session,
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        phone: { label: "موبایل", type: "tel" },
        password: { label: "رمز", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const phone = normalizePhone(parsed.data.phone);
        if (!isValidIranMobile(phone)) return null;

        const user = await prisma.user.findFirst({ where: { phone } });
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
