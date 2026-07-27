/** Public URL prefix for the management panel (not linked from the storefront). */
export const ADMIN_PATH =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_ADMIN_PATH?.trim()) ||
  "/yaqoot-cms";

/** Build a panel URL, e.g. adminHref("/products") → "/yaqoot-cms/products" */
export function adminHref(subPath = ""): string {
  if (!subPath || subPath === "/") return ADMIN_PATH;
  const path = subPath.startsWith("/") ? subPath : `/${subPath}`;
  return `${ADMIN_PATH}${path}`;
}

export function isAdminPublicPath(pathname: string): boolean {
  return pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
}
