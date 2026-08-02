import { ADMIN_PATH } from "@/lib/admin-path";

const ALLOWED_PREFIXES = [
  "/dashboard",
  "/checkout",
  "/cart",
  "/rugs",
  "/register",
  "/login",
  ADMIN_PATH,
];

/** Validates an internal post-login redirect path. */
export function safeCallbackUrl(raw: string | null, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || /[:\\@]/.test(raw)) {
    return fallback;
  }

  try {
    const decoded = decodeURIComponent(raw);
    if (decoded !== raw && /[:\\@]/.test(decoded)) return fallback;

    const allowed = ALLOWED_PREFIXES.some(
      (p) => raw === p || raw.startsWith(`${p}/`) || raw.startsWith(`${p}?`),
    );
    return allowed ? raw : fallback;
  } catch {
    return fallback;
  }
}
