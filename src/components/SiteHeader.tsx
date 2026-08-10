"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  IconCart,
  IconClose,
  IconHeart,
  IconSearch,
  IconUser,
  LogoMark,
} from "@/components/Icons";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { LiveSearch } from "@/components/LiveSearch";
import { adminHref } from "@/lib/admin-path";

const links = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/rugs", label: "محصولات" },
  { href: "/articles", label: "مقالات" },
  { href: "/#faq", label: "سوالات متداول" },
  { href: "/#contact", label: "تماس با ما" },
];

const ease = [0.22, 1, 0.36, 1] as const;

/** Header only — sits inside unified top band (no separate chrome) */
export function SiteHeader({ embedded = false }: { embedded?: boolean }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { count, ready: cartReady } = useCart();
  const { count: wishCount } = useWishlist();
  const { data: session } = useSession();
  const accountHref = !session?.user
    ? "/login"
    : session.user.role === "ADMIN"
      ? adminHref()
      : "/dashboard";
  const cartBadge = cartReady ? count : 0;

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className={`relative z-50 px-4 py-3 sm:px-6 ${
        embedded ? "" : "sticky top-0 border-b border-[var(--sa-border)] bg-[var(--sa-cream)]"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-5 lg:gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <LogoMark size={38} />
            <span className="leading-none">
              <span className="font-display block translate-y-1 text-xl leading-[1.7] text-[var(--sa-gold)] sm:text-2xl">
                فرش یاقوت
              </span>
            </span>
          </Link>

          <nav className="hidden items-center xl:flex" aria-label="منوی اصلی">
            {links.map((l) => {
              const isActive =
                (l.label === "صفحه اصلی" && pathname === "/") ||
                (l.label === "محصولات" && pathname.startsWith("/rugs")) ||
                (l.label === "مقالات" && pathname.startsWith("/articles"));
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  className={`relative whitespace-nowrap px-3 py-2 text-sm ${
                    isActive
                      ? "font-semibold text-[var(--sa-navy)]"
                      : "text-[var(--sa-text-muted)] hover:text-[var(--sa-navy)]"
                  }`}
                >
                  {l.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[var(--sa-gold)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LiveSearch variant="desktop" className="hidden md:block" />

          <motion.button
            type="button"
            className={`relative z-[80] flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-btn)] md:hidden ${
              searchOpen
                ? "bg-[var(--sa-navy)] text-[var(--sa-gold)]"
                : "text-[var(--sa-navy)] hover:bg-[var(--sa-bone-deep)]"
            }`}
            aria-label={searchOpen ? "بستن جستجو" : "جستجو"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {searchOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconClose size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="search"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconSearch size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <Link
            href="/cart?tab=wishlist"
            className="relative hidden h-10 w-10 items-center justify-center rounded-[var(--sa-radius-btn)] text-[var(--sa-navy)] hover:bg-[var(--sa-bone-deep)] sm:flex"
            aria-label={wishCount > 0 ? `علاقه‌مندی (${wishCount})` : "علاقه‌مندی"}
          >
            <IconHeart size={20} filled={wishCount > 0} />
            {wishCount > 0 && (
              <span className="absolute top-1 left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--sa-navy)] px-1 text-[10px] font-bold leading-none text-[var(--sa-text-on-navy)]">
                {wishCount > 9 ? "۹+" : new Intl.NumberFormat("fa-IR").format(wishCount)}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-btn)] text-[var(--sa-navy)] hover:bg-[var(--sa-bone-deep)]"
            aria-label={cartBadge > 0 ? `سبد خرید (${cartBadge})` : "سبد خرید"}
          >
            <IconCart size={20} />
            {cartBadge > 0 && (
              <span className="absolute top-1 left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--sa-gold)] px-1 text-[10px] font-bold leading-none text-[var(--sa-text)]">
                {cartBadge > 9 ? "۹+" : new Intl.NumberFormat("fa-IR").format(cartBadge)}
              </span>
            )}
          </Link>
          <Link
            href={accountHref}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-btn)] text-[var(--sa-navy)] hover:bg-[var(--sa-bone-deep)]"
            aria-label="حساب کاربری"
          >
            <IconUser size={20} />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="mobile-search"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease }}
            className="relative z-[90] mx-auto mt-3 max-w-6xl md:hidden"
          >
            <LiveSearch
              variant="mobile"
              autoFocus
              inputRef={inputRef}
              onNavigate={() => setSearchOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
