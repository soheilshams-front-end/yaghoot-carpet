import Link from "next/link";
import { IconInstagram, IconPhone, LogoMark } from "@/components/Icons";
import { footerLinks as defaultLinks } from "@/data/site";
import { getSiteSetting, listCategories } from "@/lib/cms";
import {
  BRAND_ADDRESS,
  BRAND_NAME,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from "@/lib/brand";

export async function SiteFooter() {
  const [support, footer, shopCats] = await Promise.all([
    getSiteSetting("support", {
      phone: "09124496001",
      phoneDisplay: "۰۹۱۲۴۴۹۶۰۰۱",
      city: "آران و بیدگل",
    }),
    getSiteSetting("footer", {
      about:
        "فرش یاقوت نقش مشهد با تمرکز بر کیفیت بافت، تنوع طرح و قیمت درب کارخانه در آران و بیدگل (قطب فرش کاشان)، تجربه‌ای مطمئن از خرید فرش ایرانی را فراهم می‌کند.",
      links: defaultLinks,
    }),
    listCategories({ homeOnly: true, activeOnly: true }),
  ]);

  const links = (footer.links as typeof defaultLinks) || defaultLinks;
  const quick = (links.quick || defaultLinks.quick).filter(
    (l) => !l.href.startsWith("/admin") && !l.label.includes("مدیریت"),
  );
  const cats =
    shopCats.length > 0
      ? shopCats.map((c) => ({
          href: `/rugs?collection=${c.slug}`,
          label: c.title,
        }))
      : links.cats || defaultLinks.cats;

  const city =
    (typeof support.city === "string" && support.city.trim()) ||
    BRAND_ADDRESS.addressLocality;

  return (
    <footer id="contact" className="relative mt-auto overflow-hidden bg-[var(--sa-cream)]">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: "url(/shah-abbasi/carpet-pattern-b.webp)",
          backgroundSize: "420px 420px",
          backgroundRepeat: "repeat",
          mixBlendMode: "multiply",
          filter: "saturate(0.85)",
        }}
        aria-hidden
      />

      <div className="relative z-10 px-4 py-6 sm:px-5 sm:py-[clamp(2rem,4vw,3.5rem)]">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 md:gap-10">
          <div>
            <div className="flex items-center gap-2 text-[var(--sa-gold)]">
              <LogoMark size={32} />
              <span className="font-display text-lg leading-[1.45] sm:text-xl">فرش یاقوت</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-[var(--sa-navy)] sm:mt-3 sm:text-base">
              فروشگاه {BRAND_NAME}
            </h3>
            <p className="mt-2 text-xs leading-6 text-[var(--sa-text-muted)] sm:mt-3 sm:text-sm sm:leading-7">
              {footer.about}
            </p>
            <p className="mt-3 text-xs text-[var(--sa-text-muted)] sm:mt-4 sm:text-sm">
              {city}، {BRAND_ADDRESS.streetAddress} — قطب فرش کاشان
            </p>
            <p className="mt-2 flex items-center gap-2 text-xs text-[var(--sa-text)] sm:text-sm">
              <IconPhone size={15} className="text-[var(--sa-gold)]" />
              <a href={`tel:${support.phone}`} className="hover:underline">
                {support.phoneDisplay}
              </a>
            </p>
            <p className="mt-2 flex items-center gap-2 text-xs text-[var(--sa-text)] sm:text-sm">
              <IconInstagram size={15} className="text-[var(--sa-gold)]" />
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                dir="ltr"
              >
                @{INSTAGRAM_HANDLE}
              </a>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:contents">
            <div>
              <h3 className="mb-2.5 text-sm font-semibold text-[var(--sa-navy)] sm:mb-4 sm:text-base">
                دسترسی سریع
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {quick.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-xs text-[var(--sa-text-muted)] hover:text-[var(--sa-navy)] sm:text-sm"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2.5 text-sm font-semibold text-[var(--sa-navy)] sm:mb-4 sm:text-base">
                دسته‌بندی‌ها
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {cats.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-xs text-[var(--sa-text-muted)] hover:text-[var(--sa-navy)] sm:text-sm"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-[var(--sa-navy-deep)] px-4 py-3 text-center text-xs text-[var(--sa-text-on-navy)]/80">
        کلیه حقوق برای فروشگاه {BRAND_NAME} محفوظ است
      </div>
    </footer>
  );
}
