"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PatternFill } from "@/components/PatternFill";
import { RugCard } from "@/components/RugCard";
import {
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
  IconPhone,
} from "@/components/Icons";
import { AnimShield, AnimTag, AnimTruck } from "@/components/AnimatedTrustIcons";
import { useToast } from "@/components/Toast";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import {
  collectionLabel,
  formatPrice,
  shanehMeta,
  type Rug,
} from "@/data/rugs";
import {
  defaultSizeId,
  sizesForProduct,
  type SizeId,
} from "@/lib/sizes";
import { MAX_QTY } from "@/components/CartProvider";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  rug: Rug;
  related: Rug[];
  supportPhone?: string;
  supportPhoneDisplay?: string;
};

export function RugDetail({
  rug,
  related,
  supportPhone = "09124496001",
  supportPhoneDisplay = "۰۹۱۲۴۴۹۶۰۰۱",
}: Props) {
  const { notify } = useToast();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const liked = has(rug.id);
  const offeredSizes = useMemo(
    () => sizesForProduct(rug.availableSizes),
    [rug.availableSizes],
  );
  const [sizeId, setSizeId] = useState<SizeId>(() =>
    defaultSizeId(rug.availableSizes),
  );
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [dir, setDir] = useState(1);

  const size = offeredSizes.find((s) => s.id === sizeId) ?? offeredSizes[0]!;
  const meta = shanehMeta(rug.shaneh);
  const collection = collectionLabel(rug.collection);
  const total = Math.round(rug.price * size.factor * qty);

  const photos = useMemo(() => {
    const g = rug.gallery?.filter(Boolean) ?? [];
    if (g.length) return g;
    return rug.image ? [rug.image] : [];
  }, [rug.gallery, rug.image]);

  useEffect(() => {
    setPhoto(0);
    setSizeId(defaultSizeId(rug.availableSizes));
    setQty(1);
  }, [rug.id, rug.availableSizes]);

  // no auto-rotate — only real product image for honest UX

  const specs = useMemo(
    () => [
      { label: "شانه", value: `${toFa(rug.shaneh)} شانه` },
      { label: "تراکم", value: meta.density },
      { label: "کالکشن", value: collection },
      { label: "کد محصول", value: rug.code },
      {
        label: "جنس طرح",
        value: rug.collection === "silk" ? "ابریشم" : "اکریلیک / گل‌ابریشم",
      },
    ],
    [rug, meta, collection],
  );

  const slide = {
    enter: (d: number) => ({ x: d > 0 ? -64 : 64, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? 64 : -64, opacity: 0 }),
  };

  function addToCart() {
    addItem({
      rugId: rug.id,
      title: rug.title,
      image: rug.image,
      code: rug.code,
      unitPrice: rug.price,
      sizeId: size.id,
      sizeLabel: size.label,
      factor: size.factor,
      qty,
      active: true,
    });
    notify(
      "به سبد اضافه شد",
      `«${rug.title}» · ${size.label} متر · تعداد ${toFa(qty)}`,
      "success",
      { label: "مشاهده سبد", href: "/cart" },
    );
  }

  function toggleLike() {
    const added = toggle({
      id: rug.id,
      title: rug.title,
      image: rug.image,
      code: rug.code,
      price: rug.price,
      collection: rug.collection,
      shaneh: rug.shaneh,
      stock: 9999,
      description: rug.description,
    });
    notify(
      added ? "به علاقه‌مندی اضافه شد" : "از علاقه‌مندی حذف شد",
      rug.title,
      added ? "success" : "info",
      added ? { label: "مشاهده علاقه‌مندی", href: "/cart?tab=wishlist" } : undefined,
    );
  }

  function goPhoto(next: number, d: number) {
    setDir(d);
    setPhoto(next);
  }

  return (
    <>
      <section className="relative overflow-hidden px-4 py-7 pb-24 sm:px-6 sm:py-9 md:pb-9">
        <PatternFill motif="islimi" opacity={0.03} />
        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="mb-5 flex flex-wrap items-center gap-1 text-xs text-[var(--sa-text-muted)]"
            aria-label="مسیر صفحه"
          >
            <Link href="/" className="hover:text-[var(--sa-navy)]">
              خانه
            </Link>
            <IconChevronRight size={13} className="opacity-40" />
            <Link href="/rugs" className="hover:text-[var(--sa-navy)]">
              فروشگاه
            </Link>
            <IconChevronRight size={13} className="opacity-40" />
            <Link
              href={`/rugs?collection=${rug.collection}`}
              className="hover:text-[var(--sa-navy)]"
            >
              {collection}
            </Link>
            <IconChevronRight size={13} className="opacity-40" />
            <span className="line-clamp-1 text-[var(--sa-navy)]">{rug.title}</span>
          </motion.nav>

          <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease }}
              className="flex h-full min-h-[20rem] flex-col lg:min-h-0"
            >
              <div className="relative flex-1 overflow-hidden rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-navy-deep)] p-3 shadow-[0_12px_32px_rgba(30,58,95,0.14)] sm:p-4">
                <div className="relative h-full min-h-[18rem]">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.img
                    key={`${rug.id}-${photo}`}
                    src={photos[photo]}
                    alt={rug.title}
                    custom={dir}
                    variants={slide}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease }}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </AnimatePresence>
                </div>

                <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
                  <span className="rounded-full bg-[var(--sa-cream)]/95 px-2.5 py-1 text-[11px] font-medium text-[var(--sa-navy)] shadow-sm backdrop-blur-sm">
                    {toFa(rug.shaneh)} شانه
                  </span>
                </div>

                {photos.length > 1 && (
                  <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        goPhoto(photo <= 0 ? photos.length - 1 : photo - 1, -1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sa-navy)]/85 text-[var(--sa-text-on-navy)] backdrop-blur-sm"
                      aria-label="عکس قبلی"
                    >
                      <IconChevronRight size={15} />
                    </button>
                    <div className="flex gap-1.5">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`عکس ${i + 1}`}
                          onClick={() => goPhoto(i, i > photo ? 1 : -1)}
                          className={`h-1.5 rounded-full transition ${
                            i === photo ? "w-5 bg-[var(--sa-gold)]" : "w-1.5 bg-white/55"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => goPhoto((photo + 1) % photos.length, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/90 text-[var(--sa-navy)] backdrop-blur-sm"
                      aria-label="عکس بعدی"
                    >
                      <IconChevronLeft size={15} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.06, ease }}
              className="flex flex-col"
            >
              <p className="text-xs text-[var(--sa-gold)] sm:text-sm">
                کد {rug.code} · کالکشن {collection}
              </p>
              <h1 className="mt-1.5 text-2xl font-bold leading-snug text-[var(--sa-navy)] sm:text-[1.85rem]">
                {rug.title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--sa-text-muted)]">{rug.description}</p>
              <p className="mt-1.5 text-xs leading-6 text-[var(--sa-text-muted)]">
                {meta.feel} — {meta.knots}.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {specs.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.04, duration: 0.35, ease }}
                    className="rounded-xl border border-[var(--sa-border)] bg-[var(--sa-bg)] px-3 py-2.5"
                  >
                    <p className="text-[10px] text-[var(--sa-text-muted)]">{s.label}</p>
                    <p className="mt-0.5 text-xs font-semibold text-[var(--sa-navy)] sm:text-[13px]">
                      {s.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5">
                <p className="text-xs font-medium text-[var(--sa-navy)] sm:text-sm">انتخاب ابعاد</p>
                <p className="mt-0.5 text-[11px] text-[var(--sa-text-muted)]">
                  قیمت پایه برای ۳×۴ متر (۱۲ متری) است.
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {offeredSizes.map((s) => {
                    const active = s.id === sizeId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSizeId(s.id)}
                        className={`h-9 rounded-full px-2 text-xs font-medium transition ${
                          active
                            ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] ring-2 ring-[var(--sa-gold)]"
                            : "bg-white text-[var(--sa-navy)] ring-1 ring-[var(--sa-border)] hover:bg-[var(--sa-cream)]"
                        }`}
                      >
                        {s.label}
                        <span
                          className={`mr-1 ${active ? "text-[var(--sa-gold)]" : "text-[var(--sa-text-muted)]"}`}
                        >
                          {s.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--sa-border)] pt-4">
                <div>
                  <p className="text-[11px] text-[var(--sa-text-muted)]">قیمت نهایی</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={total}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="mt-0.5 text-xl font-bold text-[var(--sa-navy)] sm:text-2xl"
                    >
                      {formatPrice(total)}
                    </motion.p>
                  </AnimatePresence>
                  <p className="mt-0.5 text-[11px] text-[var(--sa-text-muted)]">
                    {size.label} متر · تعداد {toFa(qty)}
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-full border border-[var(--sa-border)] bg-white p-0.5">
                  <button
                    type="button"
                    aria-label="کاهش"
                    disabled={qty <= 1}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--sa-navy)] transition hover:bg-[var(--sa-cream)] disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="min-w-[1.25rem] text-center text-sm font-semibold text-[var(--sa-navy)]">
                    {toFa(qty)}
                  </span>
                  <button
                    type="button"
                    aria-label="افزایش"
                    disabled={qty >= MAX_QTY}
                    onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--sa-navy)] transition hover:bg-[var(--sa-cream)] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <button
                  type="button"
                  onClick={addToCart}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--sa-gold)] text-sm font-semibold text-[var(--sa-text)] transition hover:brightness-105"
                >
                  افزودن به سبد
                </button>
                <a
                  href={`tel:${supportPhone}`}
                  onClick={() => notify("مشاوره", "در حال تماس با کارشناس…", "info")}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[var(--sa-navy)] bg-[var(--sa-navy)] text-sm font-medium text-[var(--sa-text-on-navy)] transition hover:opacity-90"
                >
                  <IconPhone size={15} />
                  مشاوره خرید
                </a>
                <button
                  type="button"
                  onClick={toggleLike}
                  aria-pressed={liked}
                  aria-label={liked ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition sm:w-auto sm:gap-1.5 sm:px-4 ${
                    liked
                      ? "border-[var(--sa-gold)] bg-[var(--sa-gold)]/15 text-[var(--sa-navy)]"
                      : "border-[var(--sa-border)] bg-white text-[var(--sa-navy)] hover:border-[var(--sa-gold)]"
                  }`}
                >
                  <IconHeart size={16} filled={liked} />
                  <span className="hidden text-sm font-medium sm:inline">
                    {liked ? "پسندیده‌اید" : "علاقه‌مندی"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-2.5">
            {[
              { Icon: AnimTruck, label: "ارسال سراسر کشور", hint: "پیگیری آنلاین" },
              { Icon: AnimShield, label: "ضمانت ۵ ساله", hint: "اصالت بافت" },
              { Icon: AnimTag, label: "قیمت کارخانه", hint: "بدون واسطه" },
            ].map(({ Icon, label, hint }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease }}
                whileHover={{ y: -3 }}
                className="group relative overflow-hidden rounded-xl border border-[var(--sa-border)] bg-[var(--sa-bg)] px-2 py-3 text-center shadow-[0_4px_14px_rgba(30,58,95,0.04)] transition hover:border-[var(--sa-gold)]/50 hover:shadow-[0_10px_24px_rgba(30,58,95,0.1)] sm:px-3 sm:py-3.5"
              >
                <span
                  className="pointer-events-none absolute -left-4 -top-4 h-16 w-16 rounded-full bg-[var(--sa-gold)]/10 opacity-0 transition group-hover:opacity-100"
                  aria-hidden
                />
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] transition group-hover:bg-[var(--sa-gold)] group-hover:text-[var(--sa-text)] sm:h-10 sm:w-10">
                  <Icon size={18} />
                </span>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease }}
                  className="mt-2 text-[10px] font-semibold text-[var(--sa-navy)] sm:text-[11px]"
                >
                  {label}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.28 + i * 0.08, ease }}
                  className="mt-0.5 hidden text-[10px] text-[var(--sa-text-muted)] sm:block"
                >
                  {hint}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 pb-7 sm:px-6 sm:pb-9">
        <PatternFill motif="ornament" opacity={0.03} />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-2.5 md:grid-cols-3 md:gap-3">
            <InfoCard
              index={0}
              Icon={AnimShield}
              title="نگهداری"
              body="جاروبرقی ملایم، دور از رطوبت مستقیم، و چرخش دوره‌ای فرش برای یکنواختی سایش."
            />
            <InfoCard
              index={1}
              Icon={AnimTruck}
              title="ارسال و بسته‌بندی"
              body="بسته‌بندی رول‌شده با محافظ لبه؛ ارسال به سراسر کشور با امکان پیگیری."
            />
            <InfoCard
              index={2}
              Icon={AnimTag}
              title="اصالت و ضمانت"
              body="خرید مستقیم از کارخانه فرش یاقوت با ضمانت ۵ ساله اصالت بافت و ثبات رنگ."
            />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="relative overflow-hidden px-4 pb-24 sm:px-6 sm:pb-12 md:pb-12">
          <PatternFill motif="floral" opacity={0.035} />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[var(--sa-navy)] sm:text-xl">طرح‌های مرتبط</h2>
                <p className="mt-0.5 text-xs text-[var(--sa-text-muted)] sm:text-sm">
                  پیشنهادهایی از کالکشن {collection}
                </p>
              </div>
              <Link
                href={`/rugs?collection=${rug.collection}`}
                className="text-xs text-[var(--sa-navy)] underline-offset-2 hover:underline sm:text-sm"
              >
                مشاهده بیشتر
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <RugCard key={r.id} rug={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky buy bar — mobile only, above tab bar */}
      <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-[85] border-t border-[var(--sa-border)] bg-[var(--sa-bg)]/95 px-3 py-2 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-[var(--sa-text-muted)]">{size.label} متر</p>
            <p className="text-sm font-bold text-[var(--sa-navy)]">{formatPrice(total)}</p>
          </div>
          <button
            type="button"
            onClick={toggleLike}
            aria-label="علاقه‌مندی"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
              liked
                ? "border-[var(--sa-gold)] bg-[var(--sa-gold)]/15 text-[var(--sa-navy)]"
                : "border-[var(--sa-border)] bg-white text-[var(--sa-navy)]"
            }`}
          >
            <IconHeart size={16} filled={liked} />
          </button>
          <button
            type="button"
            onClick={addToCart}
            className="flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--sa-gold)] text-sm font-semibold text-[var(--sa-text)]"
          >
            افزودن به سبد
          </button>
        </div>
      </div>
    </>
  );
}

function InfoCard({
  title,
  body,
  Icon,
  index,
}: {
  title: string;
  body: string;
  Icon: typeof AnimTruck;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4 shadow-[0_6px_18px_rgba(30,58,95,0.05)] transition hover:border-[var(--sa-gold)]/45 hover:shadow-[0_14px_32px_rgba(30,58,95,0.12)] sm:p-5"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-right scale-x-0 bg-gradient-to-l from-[var(--sa-gold)] to-[var(--sa-navy)] transition duration-500 group-hover:scale-x-100"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[var(--sa-navy)]/[0.04] transition group-hover:bg-[var(--sa-gold)]/10"
        aria-hidden
      />

      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] transition duration-300 group-hover:bg-[var(--sa-gold)] group-hover:text-[var(--sa-text)]">
          <Icon size={18} />
        </span>
        <div className="min-w-0 overflow-hidden">
          <motion.h3
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.12 + index * 0.1, ease }}
            className="text-sm font-bold text-[var(--sa-navy)]"
          >
            {title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.28 + index * 0.1, ease }}
            className="mt-1.5 text-xs leading-6 text-[var(--sa-text-muted)]"
          >
            {body}
          </motion.p>
        </div>
      </div>
    </motion.article>
  );
}

function toFa(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}
