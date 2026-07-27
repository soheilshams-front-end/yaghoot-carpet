"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { PatternFill } from "@/components/PatternFill";
import { useToast } from "@/components/Toast";
import { EmptyState } from "@/components/EmptyState";
import { useWishlist } from "@/components/WishlistProvider";
import { useDashboard, NAV } from "@/components/dashboard/DashboardShell";
import {
  IconChevronLeft,
  IconClose,
  IconPhone,
  IconShield,
  IconTag,
  IconTruck,
} from "@/components/Icons";
import { formatPrice, type Rug } from "@/data/rugs";
import type { DashOrder, DashUser } from "@/lib/dashboard";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  user: DashUser;
  orders: DashOrder[];
  wishlist?: Rug[];
  supportPhone?: string;
  supportPhoneDisplay?: string;
};

export function UserDashboard({
  user,
  orders,
  supportPhone = "09124496001",
  supportPhoneDisplay = "۰۹۱۲۴۴۹۶۰۰۱",
}: Props) {
  const { notify } = useToast();
  const { tab, setTab, open, toggle } = useDashboard();
  const { items: wishlist, remove: removeWishLocal } = useWishlist();

  const active = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED",
  ).length;
  const done = orders.filter((o) => o.status === "DELIVERED").length;

  function removeWish(id: string, title: string) {
    removeWishLocal(id);
    notify("حذف شد", `«${title}» از علاقه‌مندی برداشته شد`);
  }

  return (
    <section className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <PatternFill motif="islimi" opacity={0.03} />
      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Mobile section switcher */}
        <div className="mb-4 lg:hidden">
          <div className="mb-2 flex h-8 items-center justify-between">
            <p className="text-xs font-semibold text-[var(--sa-navy)]">بخش‌ها</p>
            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-8 items-center rounded-lg border border-[var(--sa-border)] bg-white px-2.5 text-[11px] text-[var(--sa-navy)]"
            >
              {open ? "جمع کردن" : "نمایش منو"}
            </button>
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-1.5">
                  {NAV.map((item) => {
                    const on = tab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-medium ${
                          on
                            ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
                            : "bg-[var(--sa-bg)] text-[var(--sa-navy)] ring-1 ring-[var(--sa-border)]"
                        }`}
                      >
                        <item.Icon size={13} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <Panel key="overview">
              <Header
                title="داشبورد"
                subtitle="خلاصه وضعیت حساب و سفارش‌های شما"
              />

              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 lg:grid-cols-4">
                <Stat
                  label="سفارش فعال"
                  value={toFa(active)}
                  Icon={IconTruck}
                  onClick={() => setTab("orders")}
                />
                <Stat
                  label="تحویل‌شده"
                  value={toFa(done)}
                  Icon={IconShield}
                  onClick={() => setTab("orders")}
                />
                <Stat
                  label="علاقه‌مندی"
                  value={toFa(wishlist.length)}
                  Icon={IconTag}
                  onClick={() => setTab("wishlist")}
                />
                <Stat
                  label="پشتیبانی"
                  value="۲۴/۷"
                  Icon={IconPhone}
                  onClick={() => {
                    notify("پشتیبانی", supportPhoneDisplay, "info");
                    window.location.href = `tel:${supportPhone}`;
                  }}
                />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <Box
                  title="آخرین سفارش‌ها"
                  actionLabel="همه"
                  onAction={() => setTab("orders")}
                >
                  {orders.length === 0 ? (
                    <Empty href="/rugs" />
                  ) : (
                    <div className="space-y-2.5">
                      {orders.slice(0, 2).map((o, i) => (
                        <OrderRow
                          key={o.id}
                          order={o}
                          index={i}
                          onTrack={() =>
                            o.status === "PENDING_PAYMENT" && o.paymentRef
                              ? (window.location.href = `/checkout/pay?authority=${encodeURIComponent(o.paymentRef)}`)
                              : notify("پیگیری", `${o.code} · ${o.statusLabel}`, "info")
                          }
                        />
                      ))}
                    </div>
                  )}
                </Box>

                <Box
                  title="علاقه‌مندی"
                  actionLabel="همه"
                  onAction={() => setTab("wishlist")}
                >
                  {wishlist.length === 0 ? (
                    <Empty href="/rugs" />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {wishlist.slice(0, 2).map((r, i) => (
                        <MiniWish
                          key={r.id}
                          rug={r}
                          index={i}
                          onRemove={() => removeWish(r.id, r.title)}
                        />
                      ))}
                    </div>
                  )}
                </Box>
              </div>
            </Panel>
          )}

          {tab === "orders" && (
            <Panel key="orders">
              <Header title="سفارش‌ها" subtitle="پیگیری و جزئیات خریدها" />
              {orders.length === 0 ? (
                <div className="mt-5">
                  <EmptyState
                    title="هنوز سفارشی ندارید"
                    description="از فروشگاه خرید کنید تا اینجا نمایش داده شود."
                    actionHref="/rugs"
                    actionLabel="فروشگاه"
                  />
                </div>
              ) : (
                <div className="mt-5 space-y-2.5">
                  {orders.map((o, i) => (
                    <OrderRow
                      key={o.id}
                      order={o}
                      index={i}
                      detailed
                      onTrack={() =>
                        o.status === "PENDING_PAYMENT" && o.paymentRef
                          ? (window.location.href = `/checkout/pay?authority=${encodeURIComponent(o.paymentRef)}`)
                          : notify("پیگیری سفارش", `${o.code} به‌روز شد`, "info")
                      }
                      onCopy={() => {
                        void navigator.clipboard?.writeText(o.code);
                        notify("کپی شد", o.code);
                      }}
                    />
                  ))}
                </div>
              )}
            </Panel>
          )}

          {tab === "wishlist" && (
            <Panel key="wishlist">
              <Header
                title="علاقه‌مندی"
                subtitle="فرش‌های ذخیره‌شده روی این دستگاه"
                link={{ href: "/cart?tab=wishlist", label: "مشاهده همه" }}
              />
              {wishlist.length === 0 ? (
                <div className="mt-5">
                  <Empty href="/rugs" />
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 lg:grid-cols-3">
                  {wishlist.map((r, i) => (
                    <WishCard
                      key={r.id}
                      rug={r}
                      index={i}
                      onRemove={() => removeWish(r.id, r.title)}
                    />
                  ))}
                </div>
              )}
            </Panel>
          )}

          {tab === "account" && (
            <Panel key="account">
              <Header title="حساب من" subtitle="اطلاعات کاربری" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field label="نام" value={user.name} />
                <Field label="تلفن" value={user.phone} />
                <Field label="شهر" value={user.city} />
                <Field label="آدرس" value={user.address} />
                <Field label="عضویت" value={user.memberSince} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => notify("ویرایش", "از پشتیبانی درخواست دهید", "info")}
                  className="inline-flex h-8 items-center rounded-lg bg-[var(--sa-navy)] px-3 text-xs text-[var(--sa-text-on-navy)] sm:h-10 sm:rounded-xl sm:px-4 sm:text-sm"
                >
                  ویرایش اطلاعات
                </button>
                <button
                  type="button"
                  onClick={() => void signOut({ callbackUrl: "/" })}
                  className="inline-flex h-8 items-center rounded-lg border border-[var(--sa-border)] bg-white px-3 text-xs text-[var(--sa-navy)] sm:h-10 sm:rounded-xl sm:px-4 sm:text-sm"
                >
                  خروج
                </button>
              </div>
            </Panel>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease }}
    >
      {children}
    </motion.div>
  );
}

function Header({
  title,
  subtitle,
  link,
}: {
  title: string;
  subtitle: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-[var(--sa-navy)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--sa-text-muted)]">{subtitle}</p>
      </div>
      {link && (
        <Link
          href={link.href}
          className="text-sm text-[var(--sa-navy)] underline-offset-2 hover:underline"
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  Icon,
  onClick,
}: {
  label: string;
  value: string;
  Icon: typeof IconTruck;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-3 text-right shadow-[0_6px_18px_rgba(30,58,95,0.05)] sm:rounded-2xl sm:p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] text-[var(--sa-text-muted)] sm:text-xs">{label}</p>
          <p className="mt-1 text-base font-bold text-[var(--sa-navy)] sm:mt-1.5 sm:text-xl">{value}</p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] sm:h-9 sm:w-9 sm:rounded-xl">
          <Icon size={14} />
        </span>
      </div>
    </motion.button>
  );
}

function Box({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4 shadow-[0_6px_18px_rgba(30,58,95,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-[var(--sa-navy)]">{title}</h2>
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="text-xs text-[var(--sa-text-muted)] hover:text-[var(--sa-navy)]"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

type Order = DashOrder;

function OrderRow({
  order,
  index,
  detailed,
  onTrack,
  onCopy,
}: {
  order: Order;
  index: number;
  detailed?: boolean;
  onTrack: () => void;
  onCopy?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease }}
      className="flex gap-3 rounded-xl border border-[var(--sa-border)] bg-white/80 p-3"
    >
      <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--sa-navy)]">
        {order.rug && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={order.rug.image} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--sa-navy)]">
              {order.rugTitle}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--sa-text-muted)]">
              {order.code} · {order.date}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--sa-navy)]/8 px-2.5 py-1 text-[10px] text-[var(--sa-navy)]">
            {order.statusLabel}
          </span>
        </div>

        {detailed && (
          <div className="mt-2.5 flex items-center gap-1">
            {order.timeline.map((step, i) => (
              <div key={step.label} className="flex flex-1 items-center gap-1">
                <div
                  className={`h-1.5 flex-1 rounded-full ${
                    step.done ? "bg-[var(--sa-gold)]" : "bg-[var(--sa-border)]"
                  }`}
                  title={step.label}
                />
                {i < order.timeline.length - 1 && null}
              </div>
            ))}
          </div>
        )}
        {detailed && (
          <div className="mt-1 flex justify-between text-[10px] text-[var(--sa-text-muted)]">
            {order.timeline.map((s) => (
              <span key={s.label} className={s.done ? "text-[var(--sa-navy)]" : ""}>
                {s.label}
              </span>
            ))}
          </div>
        )}

        {!detailed && (
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--sa-border)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${order.progress}%` }}
              transition={{ duration: 0.8, delay: 0.12 + index * 0.05, ease }}
              className="h-full rounded-full bg-gradient-to-l from-[var(--sa-gold)] to-[var(--sa-navy)]"
            />
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={onTrack}
            className="h-7 rounded-lg bg-[var(--sa-navy)] px-2.5 text-[11px] text-[var(--sa-text-on-navy)]"
          >
            {order.status === "PENDING_PAYMENT" && order.paymentRef ? "ادامه پرداخت" : "پیگیری"}
          </button>
          {detailed && onCopy && (
            <button
              type="button"
              onClick={onCopy}
              className="h-7 rounded-lg border border-[var(--sa-border)] bg-white px-2.5 text-[11px] text-[var(--sa-navy)]"
            >
              کپی کد
            </button>
          )}
          {order.rug && (
            <Link
              href={`/rugs/${order.rug.id}`}
              className="inline-flex h-7 items-center gap-0.5 px-1 text-[11px] text-[var(--sa-navy)]"
            >
              محصول <IconChevronLeft size={12} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MiniWish({
  rug,
  index,
  onRemove,
}: {
  rug: Rug;
  index: number;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="relative"
    >
      <button
        type="button"
        onClick={onRemove}
        className="absolute left-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[var(--sa-navy)]"
        aria-label="حذف"
      >
        <IconClose size={11} />
      </button>
      <Link
        href={`/rugs/${rug.id}`}
        className="block overflow-hidden rounded-lg border border-[var(--sa-border)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rug.image} alt={rug.title} className="aspect-[3/4] w-full object-cover" />
      </Link>
    </motion.div>
  );
}

function WishCard({
  rug,
  index,
  onRemove,
}: {
  rug: Rug;
  index: number;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease }}
      className="relative overflow-hidden rounded-xl border border-[var(--sa-border)] bg-[var(--sa-navy)] sm:rounded-2xl"
    >
      <button
        type="button"
        onClick={onRemove}
        className="absolute left-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sa-cream)] text-[var(--sa-navy)] sm:left-2 sm:top-2 sm:h-7 sm:w-7"
        aria-label="حذف"
      >
        <IconClose size={11} />
      </button>
      <Link href={`/rugs/${rug.id}`} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rug.image} alt={rug.title} className="aspect-[3/4] w-full object-cover" />
        <div className="p-2 text-[var(--sa-text-on-navy)] sm:p-3">
          <p className="line-clamp-1 text-[11px] font-semibold sm:text-sm">{rug.title}</p>
          <p className="mt-0.5 text-[10px] text-[var(--sa-gold)] sm:mt-1 sm:text-xs">
            {formatPrice(rug.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--sa-border)] bg-[var(--sa-bg)] px-4 py-3.5">
      <p className="text-xs text-[var(--sa-text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--sa-navy)]">{value}</p>
    </div>
  );
}

function Empty({ href }: { href: string }) {
  return (
    <EmptyState
      title="موردی نیست"
      description="هنوز چیزی اینجا ذخیره نشده است."
      actionHref={href}
      actionLabel="فروشگاه"
      className="!py-8"
    />
  );
}

function toFa(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}
