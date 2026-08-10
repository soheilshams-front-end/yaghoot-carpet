import { ADMIN_PATH, isAdminPublicPath } from "@/lib/admin-path";

const ALLOWED_PREFIXES = ["/checkout", "/dashboard", ADMIN_PATH];

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

/** Role-aware destination after successful login. */
export function resolvePostLoginPath(
  role: "USER" | "ADMIN",
  raw: string | null,
): string {
  const home = role === "ADMIN" ? ADMIN_PATH : "/dashboard";
  const cb = safeCallbackUrl(raw, "");
  if (!cb) return home;
  if (role === "ADMIN") {
    return isAdminPublicPath(cb) || cb.startsWith("/checkout") ? cb : home;
  }
  return isAdminPublicPath(cb) ? home : cb;
}
