import { prisma } from "@/lib/db";

/** Validates required production environment variables at server startup. */
export function validateProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set in production (min 32 characters). Generate: openssl rand -base64 32",
    );
  }

  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    throw new Error("DATABASE_URL must be set in production");
  }
}
