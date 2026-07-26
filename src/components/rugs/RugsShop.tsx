"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PatternFill } from "@/components/PatternFill";
import { Reveal } from "@/components/Reveal";
import { RugCard } from "@/components/RugCard";
import { SiteHeader } from "@/components/SiteHeader";
import { Typewriter } from "@/components/Typewriter";
import { IconChevronLeft, IconChevronRight } from "@/components/Icons";
import { type Rug } from "@/data/rugs";
import { img } from "@/lib/images";
import { SortDropdown, type SortKey } from "@/components/rugs/SortDropdown";
import { HeroFeaturedCarousel } from "@/components/rugs/HeroFeaturedCarousel";
import { EmptyState } from "@/components/EmptyState";

const SHANEH = [1500, 1200, 1000, 700] as const;
const PER_PAGE = 6;
const ease = [0.22, 1, 0.36, 1] as const;

export type ShopCategory = { id: string; title: string };

type Props = {
  rugs: Rug[];
  total: number;
  shaneh: number | null;
  collection: string | null;
  query?: string | null;
  sort?: SortKey;
  shopCategories?: ShopCategory[];
};

export function RugsShop({
  rugs,
  total,
  shaneh,
  collection,
  query = null,
  sort = "newest",
  shopCategories = [],
}: Props) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [gridMinH, setGridMinH] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  function setSort(next: SortKey) {
    router.replace(
      buildRugsHref({ shaneh, collection, q: query, sort: next }),
      { scroll: false },
    );
  }

  const sorted = useMemo(() => {
    const list = [...rugs];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else {
      list.sort((a, b) => {
        const da = a.createdAt ?? "";
        const db = b.createdAt ?? "";
        if (da !== db) return db.localeCompare(da);
        return Number(b.id) - Number(a.id) || b.id.localeCompare(a.id);
      });
    }
    return list;
  }, [rugs, sort]);

  const maxPage = Math.max(0, Math.ceil(sorted.length / PER_PAGE) - 1);
  const slice = sorted.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  useEffect(() => {
    setPage(0);
  }, [sort, shaneh, collection, query, rugs.length]);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    if (h > 0) setGridMinH((prev) => Math.max(prev, Math.ceil(h)));
  }, [slice, page]);

  function goPage(next: number) {
    const top = productsRef.current?.getBoundingClientRect().top ?? 0;
    const before = window.scrollY;
    setPage(next);
    requestAnimationFrame(() => {
      const afterTop = productsRef.current?.getBoundingClientRect().top ?? 0;
      const delta = afterTop - top;
      if (Math.abs(delta) > 1) {
        window.scrollTo({ top: before + delta });
      }
    });
  }

  const activeChips = [
    query
      ? {
          label: `جستجو: ${query}`,
          href: buildRugsHref({ shaneh, collection, q: null, sort }),
        }
      : null,
    collection
      ? {
          label: shopCategories.find((c) => c.id === collection)?.title ?? collection,
          href: buildRugsHref({ shaneh, collection: null, q: query, sort }),
        }
      : null,
    shaneh
      ? {
          label: `${shaneh} شانه`,
          href: buildRugsHref({ shaneh: null, collection, q: query, sort }),
        }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <>
      <div className="sa-framed sa-framed-round mx-2 mt-2 sm:mx-3 sm:mt-3">
        <span className="sa-motif sa-motif-tl" aria-hidden />
        <span className="sa-motif sa-motif-tr" aria-hidden />
        <span className="sa-motif sa-motif-bl" aria-hidden />
        <span className="sa-motif sa-motif-br" aria-hidden />

        <div className="sa-framed-inner relative overflow-hidden">
          <PatternFill motif="floral" opacity={0.045} size={480} />
          <SiteHeader embedded />

          <div className="relative z-10 px-4 pb-10 pt-2 sm:px-6 sm:pb-12">
            <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <span className="inline-block rounded-full bg-[var(--sa-navy)] px-5 py-1.5 text-sm text-[var(--sa-text-on-navy)]">
                  فروشگاه آنلاین
                </span>
                <h1 className="mt-4 min-h-[1.4em] text-3xl font-bold text-[var(--sa-navy)] sm:text-4xl lg:text-[2.65rem]">
                  <Typewriter text="کالکشن فرش‌های یاقوت" speed={40} startDelay={180} />
                </h1>
                <p className="mt-3 max-w-xl text-base leading-8 text-[var(--sa-text-muted)]">
                  خرید مستقیم از کارخانه — فیلتر کنید و آنلاین سفارش دهید.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <StatPill label="محصول" value={toFa(total)} />
                  <StatPill label="ارسال" value="هماهنگی" />
                  <StatPill label="ضمانت" value="۵ ساله" />
                </div>
              </div>

              <HeroFeaturedCarousel rugs={sorted.length ? sorted : rugs} />
            </div>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden px-4 py-[clamp(2rem,4vw,3.5rem)] sm:px-6">
        <PatternFill motif="islimi" opacity={0.04} />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="sticky top-2 z-30 mb-8 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)]/95 p-3 shadow-md backdrop-blur-md sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Chip
                  href={buildRugsHref({ shaneh: null, collection: null, q: query, sort })}
                  active={!collection && !shaneh}
                >
                  همه
                </Chip>
                {shopCategories.map((c) => (
                  <Chip
                    key={c.id}
                    href={buildRugsHref({ shaneh, collection: c.id, q: query, sort })}
                    active={collection === c.id}
                  >
                    {c.title}
                  </Chip>
                ))}
                {SHANEH.map((s) => (
                  <Chip
                    key={s}
                    href={buildRugsHref({ shaneh: s, collection, q: query, sort })}
                    active={shaneh === s}
                  >
                    {s} شانه
                  </Chip>
                ))}
              </div>

              <SortDropdown value={sort} onChange={setSort} />
            </div>

            {activeChips.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--sa-border)] pt-3">
                {activeChips.map((c) => (
                  <Link
                    key={c.label}
                    href={c.href}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sa-navy)] px-3 py-1.5 text-xs text-[var(--sa-text-on-navy)]"
                  >
                    {c.label}
                    <span aria-hidden>×</span>
                  </Link>
                ))}
                <Link href="/rugs" className="text-xs text-[var(--sa-navy)] underline-offset-2 hover:underline">
                  پاک کردن همه
                </Link>
              </div>
            )}
          </div>

          <Reveal>
            <div className="mb-8 grid gap-3 md:grid-cols-3">
              <PromoCard title="قیمت درب کارخانه" desc="بدون واسطه بخرید" image={img.rug1} />
              <PromoCard title="ارسال به سراسر کشور" desc="پیگیری آنلاین سفارش" image={img.rug2} />
              <PromoCard title="۵ سال ضمانت" desc="اصالت بافت و رنگ" image={img.rug3} />
            </div>
          </Reveal>

          <div ref={productsRef} className="mb-5">
            <h2 className="text-xl font-bold text-[var(--sa-navy)] sm:text-2xl">محصولات</h2>
            <p className="mt-1 text-sm text-[var(--sa-text-muted)]">
              {toFa(sorted.length)} فرش · صفحه {toFa(page + 1)} از {toFa(maxPage + 1)}
            </p>
          </div>

          {sorted.length > 0 ? (
            <>
              <div
                ref={gridRef}
                className="relative"
                style={gridMinH ? { minHeight: gridMinH } : undefined}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${sort}-${page}-${collection ?? "all"}-${shaneh ?? "x"}-${query ?? ""}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease }}
                    className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {slice.map((rug, i) => (
                      <motion.div
                        key={rug.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.06, ease }}
                      >
                        <RugCard rug={rug} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {maxPage > 0 && (
                <div className="mt-8 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goPage(page <= 0 ? maxPage : page - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-btn)] bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] transition hover:opacity-90"
                    aria-label="قبلی"
                  >
                    <IconChevronRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => goPage(page >= maxPage ? 0 : page + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-btn)] border border-[var(--sa-border)] bg-[var(--sa-bg)] text-[var(--sa-navy)] transition hover:border-[var(--sa-gold)]"
                    aria-label="بعدی"
                  >
                    <IconChevronLeft size={18} />
                  </button>
                  <div className="mr-2 flex gap-1.5">
                    {Array.from({ length: maxPage + 1 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`صفحه ${i + 1}`}
                        onClick={() => goPage(i)}
                        className={`h-2 rounded-full transition ${
                          i === page ? "w-6 bg-[var(--sa-gold)]" : "w-2 bg-[var(--sa-navy)]/25"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title={query ? `نتیجه‌ای برای «${query}» پیدا نشد` : "چیزی پیدا نشد"}
              description={
                query
                  ? "عبارت دیگری جستجو کنید یا فیلترها را پاک کنید."
                  : "فیلتر دیگری را امتحان کنید."
              }
              actionHref="/rugs"
              actionLabel="مشاهده همه"
            />
          )}

          <div className="mt-12 overflow-hidden rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-navy)]">
            <div className="grid items-center gap-6 p-6 sm:grid-cols-[1.2fr_0.8fr] sm:p-8">
              <div className="text-[var(--sa-text-on-navy)]">
                <p className="text-sm text-[var(--sa-gold)]">مشاوره تخصصی</p>
                <h3 className="mt-2 text-2xl font-bold">برای انتخاب فرش کمک می‌خواهید؟</h3>
                <p className="mt-2 text-sm opacity-80">
                  کارشناسان فرش یاقوت برای چیدمان و انتخاب شانه کنار شما هستند.
                </p>
                <a
                  href="tel:09124496001"
                  className="mt-5 inline-flex rounded-full bg-[var(--sa-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--sa-text)]"
                >
                  تماس: ۰۹۱۲۴۴۹۶۰۰۱
                </a>
              </div>
              <div className="relative hidden aspect-[16/10] overflow-hidden rounded-xl sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.hero} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-[11px] font-medium transition sm:h-9 sm:px-3.5 sm:text-sm ${
        active
          ? "bg-[var(--sa-navy)] text-[var(--sa-text-on-navy)] ring-2 ring-[var(--sa-gold)]"
          : "bg-white text-[var(--sa-navy)] ring-1 ring-[var(--sa-border)] hover:bg-[var(--sa-cream)]"
      }`}
    >
      {children}
    </Link>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-[var(--sa-border)] bg-[var(--sa-bg)] px-3.5 py-2 text-sm text-[var(--sa-navy)]">
      <span className="font-semibold">{value}</span>
      <span className="mr-1 text-[var(--sa-text-muted)]"> {label}</span>
    </span>
  );
}

function PromoCard({
  title,
  desc,
  image,
}: {
  title: string;
  desc: string;
  image: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--sa-border)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="aspect-[21/9] w-full object-cover md:aspect-[16/7]" />
      <div className="absolute inset-0 bg-gradient-to-l from-[var(--sa-navy)]/85 to-[var(--sa-navy)]/35" />
      <div className="absolute inset-0 flex flex-col justify-center p-4 text-[var(--sa-text-on-navy)]">
        <p className="font-bold">{title}</p>
        <p className="mt-0.5 text-xs opacity-80">{desc}</p>
      </div>
    </div>
  );
}

function buildRugsHref({
  shaneh,
  collection,
  q,
  sort,
}: {
  shaneh: number | null;
  collection: string | null;
  q: string | null;
  sort?: SortKey | null;
}) {
  const params = new URLSearchParams();
  if (collection) params.set("collection", collection);
  if (shaneh) params.set("shaneh", String(shaneh));
  if (q) params.set("q", q);
  if (sort && sort !== "newest") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `/rugs?${qs}` : "/rugs";
}

function toFa(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}
