"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IconWhatsApp } from "@/components/Icons";
import { isAdminPublicPath } from "@/lib/admin-path";
import { whatsappUrl } from "@/lib/support-shared";

type Props = {
  phone: string;
};

/** Fixed circular WhatsApp FAB — bottom-left, above mobile tab bar */
export function WhatsAppFab({ phone }: Props) {
  const pathname = usePathname();
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (isAdminPublicPath(pathname) || pathname.startsWith("/admin")) return;

    const showTimer = window.setTimeout(() => setShowNotif(true), 900);
    const hideTimer = window.setTimeout(() => setShowNotif(false), 900 + 8500);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (isAdminPublicPath(pathname) || pathname.startsWith("/admin")) return null;

  const href = whatsappUrl(phone, "سلام؛ از سایت فرش یاقوت پیام می‌دهم.");

  return (
    <div
      dir="ltr"
      className="pointer-events-none fixed bottom-[calc(4.25rem+0.85rem)] left-4 z-[95] md:bottom-6 md:left-6"
    >
      <div className="relative">
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تماس با کارشناسان در واتساپ"
          onClick={() => setShowNotif(false)}
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="pointer-events-auto relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(11,31,58,0.22)] ring-2 ring-white/70"
        >
          <IconWhatsApp size={26} />
        </motion.a>

        <AnimatePresence>
          {showNotif && (
            <motion.div
              role="status"
              initial={{ opacity: 0, x: -8, y: 6, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -6, y: 4, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto absolute bottom-[calc(100%+10px)] left-0 w-[min(16.5rem,calc(100vw-2rem))]"
            >
              <div className="relative rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-navy)] px-3.5 py-3 text-right shadow-[0_12px_32px_rgba(11,31,58,0.28)]">
                <p className="text-[12.5px] font-medium leading-6 text-[var(--sa-text-on-navy)] sm:text-[13px]">
                  برای ارتباط با کارشناسان کلیک کنید
                </p>
                <button
                  type="button"
                  onClick={() => setShowNotif(false)}
                  aria-label="بستن"
                  className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[var(--sa-text-on-navy)]/55 transition hover:bg-white/10 hover:text-[var(--sa-text-on-navy)]"
                >
                  <span aria-hidden className="text-sm leading-none">
                    ×
                  </span>
                </button>
                {/* Arrow toward the FAB */}
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-5 h-3 w-3 rotate-45 border-b border-r border-[var(--sa-border)] bg-[var(--sa-navy)]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
