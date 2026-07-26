import Link from "next/link";
import { redirect } from "next/navigation";
import { AppChrome } from "@/components/AppChrome";
import { PatternFill } from "@/components/PatternFill";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/data/rugs";

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    const { code } = await searchParams;
    const qs = code ? `?callbackUrl=${encodeURIComponent(`/checkout/success?code=${code}`)}` : "?callbackUrl=/checkout/success";
    redirect(`/login${qs}`);
  }

  const { code } = await searchParams;
  const order = code
    ? await prisma.order.findFirst({
        where: { code, userId: session.user.id },
        select: {
          code: true,
          city: true,
          address: true,
          phone: true,
          total: true,
        },
      })
    : null;

  const shortAddress = order
    ? [order.city, order.address].filter(Boolean).join("، ")
    : null;

  return (
    <AppChrome>
      <section className="relative overflow-hidden px-4 py-12 sm:px-6">
        <PatternFill motif="islimi" opacity={0.03} />
        <div className="relative z-10 mx-auto max-w-md rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-6 text-center">
          <p className="text-xs font-medium text-[var(--sa-gold)]">فرش یاقوت</p>
          <h1 className="mt-1 text-xl font-bold text-[var(--sa-navy)]">سفارش ثبت شد</h1>
          <p className="mt-2 text-sm text-[var(--sa-text-muted)]">
            پرداخت تأیید شد. برای هماهنگی ارسال با شما تماس می‌گیریم.
          </p>

          {(order?.code || code) && (
            <p className="mt-4 rounded-xl bg-[var(--sa-cream)] px-3 py-2 text-sm font-semibold text-[var(--sa-navy)]">
              کد سفارش: {order?.code ?? code}
            </p>
          )}

          {order && (
            <div className="mt-4 space-y-2 rounded-xl border border-[var(--sa-border)] bg-white px-3 py-3 text-right text-xs leading-6 text-[var(--sa-text-muted)]">
              {shortAddress && (
                <p>
                  <span className="text-[var(--sa-navy)]">آدرس: </span>
                  {shortAddress}
                </p>
              )}
              <p>
                <span className="text-[var(--sa-navy)]">تماس: </span>
                {order.phone}
              </p>
              <p>
                <span className="text-[var(--sa-navy)]">مبلغ: </span>
                {formatPrice(order.total)}
              </p>
              <p>ارسال پس از هماهنگی — هزینه ارسال جداگانه اعلام می‌شود.</p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="flex h-11 items-center justify-center rounded-xl bg-[var(--sa-navy)] text-sm text-[var(--sa-text-on-navy)]"
            >
              مشاهده در داشبورد
            </Link>
            <Link
              href="/rugs"
              className="flex h-11 items-center justify-center rounded-xl border border-[var(--sa-border)] bg-white text-sm text-[var(--sa-navy)]"
            >
              ادامه خرید در فروشگاه
            </Link>
          </div>

          <a
            href="tel:09124496001"
            className="mt-5 inline-block text-xs text-[var(--sa-text-muted)] underline-offset-2 hover:text-[var(--sa-navy)] hover:underline"
          >
            پشتیبانی: ۰۹۱۲۴۴۹۶۰۰۱
          </a>
        </div>
      </section>
    </AppChrome>
  );
}
