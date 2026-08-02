"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import {
  IconCart,
  IconHeart,
  IconHome,
  IconSearch,
  IconUser,
} from "@/components/Icons";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { isAdminPublicPath, adminHref } from "@/lib/admin-path";

export function MobileTabBar() {
  return (
    <Suspense fallback={null}>
      <MobileTabBarInner />
    </Suspense>
  );
}

function MobileTabBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { count, ready: cartReady } = useCart();
  const { count: wishCount } = useWishlist();
  const { data: session } = useSession();
  const wishTab = searchParams.get("tab") === "wishlist";

  if (isAdminPublicPath(pathname) || pathname.startsWith("/admin")) return null;

  const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const accountHref = !session?.user
    ? `/login?callbackUrl=${encodeURIComponent(currentPath)}`
    : session.user.role === "ADMIN"
      ? adminHref()
      : "/dashboard";

  const cartBadge = cartReady ? count : 0;

  const items = [
    {
      href: "/",
      label: "خانه",
      active: pathname === "/",
      Icon: IconHome,
      badge: 0,
    },
    {
      href: "/rugs",
      label: "فروشگاه",
      active: pathname.startsWith("/rugs"),
      Icon: IconSearch,
      badge: 0,
    },
    {
      href: "/cart",
      label: "سبد",
      active:
        pathname.startsWith("/checkout") || (pathname === "/cart" && !wishTab),
      Icon: IconCart,
      badge: cartBadge,
    },
    {
      href: "/cart?tab=wishlist",
      label: "علاقه",
      active: pathname === "/cart" && wishTab,
      Icon: IconHeart,
      badge: wishCount,
      filled: true,
    },
    {
      href: accountHref,
      label: "حساب",
      active:
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register"),
      Icon: IconUser,
      badge: 0,
    },
  ];

  return (
    <nav
      aria-label="ناوبری موبایل"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-[var(--sa-border)] bg-[var(--sa-bg)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 pt-1">
        {items.map((tab) => {
          const badgeFa =
            tab.badge > 9
              ? "۹+"
              : new Intl.NumberFormat("fa-IR").format(tab.badge);
          const ariaLabel =
            tab.badge > 0 ? `${tab.label} (${badgeFa})` : tab.label;
          return (
            <li key={tab.label}>
              <Link
                href={tab.href}
                aria-label={ariaLabel}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] ${
                  tab.active
                    ? "font-semibold text-[var(--sa-navy)]"
                    : "text-[var(--sa-text-muted)]"
                }`}
              >
                <span className="relative">
                  <tab.Icon
                    size={20}
                    filled={tab.filled ? tab.active : undefined}
                  />
                  {tab.badge > 0 && (
                    <span
                      aria-hidden
                      className="absolute -left-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--sa-gold)] px-0.5 text-[9px] font-bold text-[var(--sa-text)]"
                    >
                      {badgeFa}
                    </span>
                  )}
                </span>
                <span aria-hidden>{tab.label}</span>
                {tab.active && (
                  <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-[var(--sa-gold)]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
