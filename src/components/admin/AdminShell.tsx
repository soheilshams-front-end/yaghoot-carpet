"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconCart,
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
  IconHome,
  IconSearch,
  IconTag,
  IconTruck,
  IconUser,
  LogoMark,
} from "@/components/Icons";
import { PatternFill } from "@/components/PatternFill";
import { AppChrome } from "@/components/AppChrome";

const RAIL_W = 232;
const ease = [0.22, 1, 0.36, 1] as const;

const NAV: {
  href: string;
  label: string;
  Icon: typeof IconHome;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "داشبورد", Icon: IconHome, exact: true },
  { href: "/admin/products", label: "کاتالوگ محصولات", Icon: IconTag },
  { href: "/admin/categories", label: "گروه‌ها و دسته‌ها", Icon: IconCart },
  { href: "/admin/orders", label: "سفارش‌ها", Icon: IconTruck },
  { href: "/admin/homepage", label: "صفحه اصلی", Icon: IconHeart },
  { href: "/admin/settings", label: "تنظیمات", Icon: IconUser },
  { href: "/admin/media", label: "رسانه", Icon: IconSearch },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setOpen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const w = open && desktop ? `${RAIL_W}px` : "0px";
    document.documentElement.style.setProperty("--sa-dash-rail", w);
    document.documentElement.classList.add("sa-dash-active");
    return () => {
      document.documentElement.style.removeProperty("--sa-dash-rail");
      document.documentElement.classList.remove("sa-dash-active");
    };
  }, [open]);

  const current = useMemo(
    () =>
      NAV.find((item) =>
        item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`),
      ) ?? NAV[0],
    [pathname],
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: open ? RAIL_W : 0 }}
        transition={{ duration: 0.4, ease }}
        className="fixed inset-y-0 right-0 z-40 hidden overflow-hidden border-l border-[var(--sa-border)] bg-[var(--sa-navy)] shadow-[-10px_0_32px_rgba(30,58,95,0.18)] lg:block"
        style={{ borderBottomLeftRadius: 28 }}
      >
        <div className="flex h-full w-[232px] flex-col">
          <div className="border-b border-white/10 px-4 py-5">
            <div className="flex items-center gap-2.5">
              <LogoMark size={28} />
              <div>
                <p className="text-[11px] text-[var(--sa-gold)]">فرش یاقوت</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--sa-text-on-navy)]">
                  پنل فروشنده
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-2.5">
            {NAV.map((item) => {
              const on =
                item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex h-11 items-center gap-2.5 rounded-xl px-3 text-sm transition ${
                    on
                      ? "text-[var(--sa-text)]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="admin-rail-nav"
                      className="absolute inset-0 rounded-xl bg-[var(--sa-gold)]"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <item.Icon size={16} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-white/10 p-3">
            <Link
              href="/rugs"
              className="flex h-10 items-center justify-center rounded-xl bg-white/10 text-xs text-[var(--sa-text-on-navy)] hover:bg-white/15"
            >
              مشاهده فروشگاه
            </Link>
            <Link
              href="/"
              className="flex h-10 items-center justify-center rounded-xl border border-white/15 text-xs text-white/75 hover:bg-white/10"
            >
              صفحه اصلی سایت
            </Link>
          </div>
        </div>
      </motion.aside>

      <motion.button
        type="button"
        initial={false}
        animate={{ right: open ? RAIL_W : 0 }}
        transition={{ duration: 0.4, ease }}
        onClick={toggle}
        className="fixed top-1/2 z-50 hidden h-12 w-7 -translate-y-1/2 items-center justify-center rounded-l-xl border border-[var(--sa-border)] border-r-0 bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] shadow-md lg:flex"
        aria-label={open ? "بستن منو" : "باز کردن منو"}
      >
        {open ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
      </motion.button>

      <AppChrome>
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
          <PatternFill motif="islimi" opacity={0.03} />
          <div className="relative z-10 mx-auto max-w-5xl">
            <div className="mb-4 lg:hidden">
              <div className="mb-2 flex h-8 items-center justify-between">
                <p className="text-xs font-semibold text-[var(--sa-navy)]">
                  {current.label}
                </p>
                <button
                  type="button"
                  onClick={() => setMobileNav((v) => !v)}
                  className="inline-flex h-8 items-center rounded-lg border border-[var(--sa-border)] bg-white px-2.5 text-[11px] text-[var(--sa-navy)]"
                >
                  {mobileNav ? "جمع کردن" : "بخش‌ها"}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {mobileNav && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-1.5 pb-1">
                      {NAV.map((item) => {
                        const on =
                          item.exact
                            ? pathname === item.href
                            : pathname === item.href ||
                              pathname.startsWith(`${item.href}/`);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-medium ${
                              on
                                ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
                                : "bg-[var(--sa-bg)] text-[var(--sa-navy)] ring-1 ring-[var(--sa-border)]"
                            }`}
                          >
                            <item.Icon size={13} />
                            {item.label.replace("کاتالوگ ", "").replace("گروه‌ها و ", "")}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {children}
          </div>
        </section>
      </AppChrome>
    </>
  );
}

export function AdminHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--sa-navy)] sm:text-2xl">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-[var(--sa-text-muted)]">{subtitle}</p>
      )}
    </div>
  );
}

export function AdminBox({
  title,
  actionLabel,
  actionHref,
  children,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[var(--sa-navy)]">{title}</h3>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="text-[11px] text-[var(--sa-navy)] underline-offset-2 hover:underline"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
