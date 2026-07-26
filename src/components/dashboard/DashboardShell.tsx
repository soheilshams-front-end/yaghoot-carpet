"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  IconCart,
  IconChevronLeft,
  IconChevronRight,
  IconTag,
  IconTruck,
  IconUser,
} from "@/components/Icons";
import { signOut } from "next-auth/react";

const RAIL_W = 232;
const ease = [0.22, 1, 0.36, 1] as const;

export type DashTab = "overview" | "orders" | "wishlist" | "account";

type DashContextValue = {
  open: boolean;
  toggle: () => void;
  setOpen: (v: boolean) => void;
  tab: DashTab;
  setTab: (t: DashTab) => void;
};

const DashContext = createContext<DashContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashContext);
  if (!ctx) throw new Error("useDashboard must be inside DashboardShell");
  return ctx;
}

const NAV: { id: DashTab; label: string; Icon: typeof IconUser }[] = [
  { id: "overview", label: "داشبورد", Icon: IconCart },
  { id: "orders", label: "سفارش‌ها", Icon: IconTruck },
  { id: "wishlist", label: "علاقه‌مندی", Icon: IconTag },
  { id: "account", label: "حساب من", Icon: IconUser },
];

export { NAV };

export function DashboardShell({
  children,
  userName,
  userCity,
}: {
  children: React.ReactNode;
  userName: string;
  userCity: string;
}) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<DashTab>("overview");

  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setOpen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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

  const value = useMemo(
    () => ({ open, toggle, setOpen, tab, setTab }),
    [open, toggle, tab],
  );

  return (
    <DashContext.Provider value={value}>
      <motion.aside
        initial={false}
        animate={{ width: open ? RAIL_W : 0 }}
        transition={{ duration: 0.4, ease }}
        className="fixed inset-y-0 right-0 z-40 hidden overflow-hidden border-l border-[var(--sa-border)] bg-[var(--sa-navy)] shadow-[-10px_0_32px_rgba(30,58,95,0.18)] lg:block"
        style={{ borderBottomLeftRadius: 28 }}
      >
        <div className="flex h-full w-[232px] flex-col">
          <div className="border-b border-white/10 px-4 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sa-gold)] text-[var(--sa-text)]">
                <IconUser size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--sa-text-on-navy)]">
                  {userName}
                </p>
                <p className="mt-0.5 text-[11px] text-white/55">{userCity}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-2.5">
            {NAV.map((item) => {
              const on = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`relative flex h-11 items-center gap-2.5 rounded-xl px-3 text-sm transition ${
                    on
                      ? "text-[var(--sa-text)]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="dash-rail-nav"
                      className="absolute inset-0 rounded-xl bg-[var(--sa-gold)]"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <item.Icon size={16} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-white/10 p-3">
            <Link
              href="/rugs"
              className="flex h-10 items-center justify-center rounded-xl bg-white/10 text-xs text-[var(--sa-text-on-navy)] transition hover:bg-white/15"
            >
              بازگشت به فروشگاه
            </Link>
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="flex h-10 w-full items-center justify-center rounded-xl border border-white/15 text-xs text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              خروج از حساب
            </button>
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

      {children}
    </DashContext.Provider>
  );
}
