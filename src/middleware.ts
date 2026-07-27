import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { ADMIN_PATH, isAdminPublicPath } from "@/lib/admin-path";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Hide the real App Router folder from the public URL
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  if (isAdminPublicPath(pathname)) {
    if (!session?.user) {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }

    const rewritten = req.nextUrl.clone();
    const rest = pathname.slice(ADMIN_PATH.length) || "";
    rewritten.pathname = `/admin${rest}`;
    return NextResponse.rewrite(rewritten);
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) {
    if (!session?.user) {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
    // Admin account belongs in the CMS panel, not the buyer dashboard
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
  ],
};
