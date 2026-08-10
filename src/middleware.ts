import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { ADMIN_PATH, isAdminPublicPath } from "@/lib/admin-path";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

function applyRateLimit(req: Request, pathname: string): Response | null {
  const ip = clientIp(req);

  if (pathname === "/api/search") {
    const result = rateLimit(`search:${ip}`, 60, 60_000);
    if (!result.ok) return rateLimitResponse(result.retryAfterSec);
  }

  if (pathname === "/api/cart/validate") {
    const result = rateLimit(`cart:${ip}`, 40, 60_000);
    if (!result.ok) return rateLimitResponse(result.retryAfterSec);
  }

  if (pathname === "/api/admin/upload") {
    const result = rateLimit(`upload:${ip}`, 30, 60_000);
    if (!result.ok) return rateLimitResponse(result.retryAfterSec);
  }

  return null;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const limited = applyRateLimit(req, pathname);
  if (limited) return limited;

  // Hide the real App Router folder from the public URL
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  if (pathname === "/login" || pathname === "/register") {
    if (session?.user) {
      const dest = session.user.role === "ADMIN" ? ADMIN_PATH : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (isAdminPublicPath(pathname)) {
    if (!session?.user) {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    // Path rewrite to /admin lives in next.config.ts (avoids Next 16 middleware rewrite → /admin → / loop)
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) {
    if (!session?.user) {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/dashboard") && session.user.role === "ADMIN") {
      return NextResponse.redirect(new URL(ADMIN_PATH, req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/yaqoot-cms",
    "/yaqoot-cms/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/checkout",
    "/checkout/:path*",
    "/login",
    "/register",
    "/api/search",
    "/api/cart/validate",
    "/api/admin/upload",
  ],
};
