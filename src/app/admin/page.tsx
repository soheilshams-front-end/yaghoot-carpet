import Link from "next/link";
import { formatPrice } from "@/data/rugs";
import { getAdminDashboard } from "@/lib/cms";
import { AdminBox, AdminHeader } from "@/components/admin/AdminShell";
import { adminHref } from "@/lib/admin-path";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const d = await getAdminDashboard();

  return (
    <div className="space-y-5">
      <AdminHeader
        title="داشبورد"
        subtitle="خلاصه وضعیت فروشگاه — اول کاتالوگ، بعد گروه‌بندی"
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {[
          { label: "محصولات فعال", value: fa(d.productCount), href: adminHref("/products") },
          { label: "سفارش‌ها", value: fa(d.orderCount), href: adminHref("/orders") },
          { label: "در انتظار پرداخت", value: fa(d.pendingOrders), href: adminHref("/orders") },
          { label: "فروش تأییدشده", value: formatPrice(d.paidRevenue), href: adminHref("/orders") },
        ].map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4 transition hover:border-[var(--sa-gold)]"
          >
            <p className="text-xs text-[var(--sa-text-muted)]">{c.label}</p>
            <p className="mt-2 text-lg font-bold text-[var(--sa-navy)]">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminBox title="راهنما" actionLabel="کاتالوگ" actionHref={adminHref("/products")}>
          <p className="text-sm leading-6 text-[var(--sa-text-muted)]">
            قیمت پایه هر محصول ۱۲ متری (۳×۴) است. سایزهای فعال، شانه و رنگ را از فرم محصول و صفحه
            اصلی تنظیم کنید.
          </p>
        </AdminBox>

        <AdminBox title="کارهای سریع">
          <div className="flex flex-col gap-2">
            <Link
              href={adminHref("/products/new")}
              className="flex h-10 items-center justify-center rounded-xl bg-[var(--sa-navy)] text-sm text-[var(--sa-text-on-navy)]"
            >
              ۱) افزودن محصول به کاتالوگ
            </Link>
            <Link
              href={adminHref("/categories")}
              className="flex h-10 items-center justify-center rounded-xl border border-[var(--sa-border)] bg-white text-sm"
            >
              ۲) چیدن در گروه‌ها
            </Link>
            <Link
              href={adminHref("/homepage")}
              className="flex h-10 items-center justify-center rounded-xl border border-[var(--sa-border)] bg-white text-sm"
            >
              ۳) تنظیم صفحه اصلی
            </Link>
          </div>
        </AdminBox>
      </div>
    </div>
  );
}

function fa(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}
