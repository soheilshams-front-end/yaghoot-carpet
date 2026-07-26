"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppChrome } from "@/components/AppChrome";
import { PatternFill } from "@/components/PatternFill";
import { useCart, lineTotal } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { useToast } from "@/components/Toast";
import { EmptyState } from "@/components/EmptyState";
import { formatPrice } from "@/data/rugs";
import { IconClose, IconHeart, IconCart } from "@/components/Icons";
import { SaSpinner } from "@/components/loading/SaSpinner";

const ease = [0.22, 1, 0.36, 1] as const;

export default function CartPage() {
  return (
    <AppChrome>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center px-4 py-16">
            <SaSpinner label="در حال بارگذاری سبد…" />
          </div>
        }
      >
        <CartView />
      </Suspense>
    </AppChrome>
  );
}

function CartView() {
  const params = useSearchParams();
  const router = useRouter();
  const initialTab = params.get("tab") === "wishlist" ? "wishlist" : "cart";
  const [tab, setTab] = useState<"cart" | "wishlist">(initialTab);

  const { items, total, setQty, removeItem, clear, count, addItem } = useCart();
  const { items: wishes, count: wishCount, remove: removeWish } = useWishlist();
  const { notify } = useToast();

  function switchTab(next: "cart" | "wishlist") {
    setTab(next);
    const url = next === "wishlist" ? "/cart?tab=wishlist" : "/cart";
    router.replace(url, { scroll: false });
  }

  function clearCartConfirmed() {
    if (!window.confirm("همه اقلام سبد پاک شود؟")) return;
    clear();
    notify("سبد خالی شد", undefined, "info");
  }

  function addWishToCart(w: (typeof wishes)[number]) {
    addItem({
      rugId: w.id,
      title: w.title,
      image: w.image,
      code: w.code,
      unitPrice: w.price,
      sizeId: "2x3",
      sizeLabel: "۲ × ۳",
      factor: 1,
      qty: 1,
      stock: w.stock,
    });
    notify("به سبد اضافه شد", w.title, "success", {
      label: "مشاهده سبد",
      href: "/cart",
    });
  }

  return (
    <section className="relative overflow-hidden px-4 py-7 sm:px-6 sm:py-9">
      <PatternFill motif="islimi" opacity={0.03} />
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--sa-navy)]">سبد و علاقه‌مندی</h1>
            <p className="mt-1 text-sm text-[var(--sa-text-muted)]">
              {tab === "cart"
                ? count > 0
                  ? `${toFa(count)} قلم در سبد`
                  : "سبد شما خالی است"
                : wishCount > 0
                  ? `${toFa(wishCount)} فرش ذخیره‌شده`
                  : "هنوز چیزی لایک نکرده‌اید"}
            </p>
          </div>
          {tab === "cart" && items.length > 0 && (
            <button
              type="button"
              onClick={clearCartConfirmed}
              className="text-xs text-[var(--sa-text-muted)] hover:text-[var(--sa-navy)]"
            >
              پاک کردن همه
            </button>
          )}
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-1.5">
          <TabBtn
            active={tab === "cart"}
            onClick={() => switchTab("cart")}
            icon={<IconCart size={15} />}
            label="سبد خرید"
            badge={count}
          />
          <TabBtn
            active={tab === "wishlist"}
            onClick={() => switchTab("wishlist")}
            icon={<IconHeart size={15} filled={tab === "wishlist"} />}
            label="علاقه‌مندی"
            badge={wishCount}
          />
        </div>

        <AnimatePresence mode="wait">
          {tab === "cart" ? (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              {items.length === 0 ? (
                <EmptyState
                  title="سبد خرید خالی است"
                  description="فرش مورد علاقه‌تان را از فروشگاه اضافه کنید."
                  actionHref="/rugs"
                  actionLabel="مشاهده فروشگاه"
                />
              ) : (
                <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-2.5">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.article
                          key={`${item.rugId}-${item.sizeId}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 24 }}
                          transition={{ duration: 0.3, ease }}
                          className="flex gap-3 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-3"
                        >
                          <Link
                            href={`/rugs/${item.rugId}`}
                            className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--sa-navy)]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <Link
                                  href={`/rugs/${item.rugId}`}
                                  className="line-clamp-1 text-sm font-semibold text-[var(--sa-navy)]"
                                >
                                  {item.title}
                                </Link>
                                <p className="mt-0.5 text-[11px] text-[var(--sa-text-muted)]">
                                  کد {item.code} · {item.sizeLabel} متر
                                </p>
                              </div>
                              <button
                                type="button"
                                aria-label="حذف"
                                onClick={() => {
                                  removeItem(item.rugId, item.sizeId);
                                  notify("حذف شد", item.title);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--sa-text-muted)] hover:bg-[var(--sa-cream)] hover:text-[var(--sa-navy)]"
                              >
                                <IconClose size={13} />
                              </button>
                            </div>

                            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex h-8 items-center rounded-lg border border-[var(--sa-border)] bg-white">
                                <button
                                  type="button"
                                  aria-label="کاهش تعداد"
                                  className="flex h-8 w-8 items-center justify-center text-[var(--sa-navy)]"
                                  onClick={() =>
                                    setQty(item.rugId, item.sizeId, item.qty - 1)
                                  }
                                >
                                  −
                                </button>
                                <span className="w-7 text-center text-sm font-semibold text-[var(--sa-navy)]">
                                  {toFa(item.qty)}
                                </span>
                                <button
                                  type="button"
                                  aria-label="افزایش تعداد"
                                  className="flex h-8 w-8 items-center justify-center text-[var(--sa-navy)] disabled:opacity-30"
                                  disabled={item.qty >= item.stock}
                                  onClick={() =>
                                    setQty(item.rugId, item.sizeId, item.qty + 1)
                                  }
                                >
                                  +
                                </button>
                              </div>
                              <p className="text-sm font-semibold text-[var(--sa-navy)]">
                                {formatPrice(lineTotal(item))}
                              </p>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </div>

                  <aside className="h-fit rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4 lg:sticky lg:top-4">
                    <h2 className="text-sm font-bold text-[var(--sa-navy)]">خلاصه سفارش</h2>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-[var(--sa-text-muted)]">جمع کل</span>
                      <span className="font-bold text-[var(--sa-navy)]">
                        {formatPrice(total)}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-[var(--sa-text-muted)]">
                      هزینه ارسال هنگام تسویه مشخص می‌شود.
                    </p>
                    <Link
                      href="/checkout"
                      className="mt-4 flex h-10 items-center justify-center rounded-xl bg-[var(--sa-gold)] text-sm font-semibold text-[var(--sa-text)]"
                    >
                      ادامه تسویه
                    </Link>
                    <Link
                      href="/rugs"
                      className="mt-2 flex h-10 items-center justify-center rounded-xl border border-[var(--sa-border)] bg-white text-sm text-[var(--sa-navy)]"
                    >
                      ادامه خرید
                    </Link>
                  </aside>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              {wishes.length === 0 ? (
                <EmptyState
                  title="علاقه‌مندی خالی است"
                  description="روی صفحه محصول، آیکن قلب را بزنید تا اینجا ذخیره شود — حتی بدون ورود."
                  actionHref="/rugs"
                  actionLabel="مشاهده فروشگاه"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
                  {wishes.map((w, i) => (
                    <motion.article
                      key={w.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.35, ease }}
                      className="overflow-hidden rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)]"
                    >
                      <Link href={`/rugs/${w.id}`} className="block aspect-[3/4] overflow-hidden bg-[var(--sa-navy)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={w.image} alt={w.title} className="h-full w-full object-cover" />
                      </Link>
                      <div className="p-2.5 sm:p-3">
                        <Link
                          href={`/rugs/${w.id}`}
                          className="line-clamp-1 text-sm font-semibold text-[var(--sa-navy)]"
                        >
                          {w.title}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-[var(--sa-text-muted)]">
                          {formatPrice(w.price)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            disabled={w.stock <= 0}
                            onClick={() => addWishToCart(w)}
                            className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[var(--sa-gold)] px-2.5 text-[11px] font-semibold text-[var(--sa-text)] disabled:opacity-40"
                          >
                            افزودن به سبد
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              removeWish(w.id);
                              notify("حذف شد", w.title, "info");
                            }}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--sa-border)] bg-white px-2.5 text-[11px] text-[var(--sa-navy)]"
                          >
                            <IconHeart size={12} filled />
                            حذف
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition ${
        active
          ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)]"
          : "text-[var(--sa-navy)] hover:bg-white/70"
      }`}
    >
      {icon}
      {label}
      {badge > 0 && (
        <span
          className={`mr-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
            active
              ? "bg-[var(--sa-gold)] text-[var(--sa-text)]"
              : "bg-[var(--sa-navy)]/10 text-[var(--sa-navy)]"
          }`}
        >
          {toFa(badge)}
        </span>
      )}
    </button>
  );
}

function toFa(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}
