"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconChat,
  IconClose,
  IconInstagram,
  IconTelegram,
  IconWhatsApp,
} from "@/components/Icons";
import { isAdminPublicPath } from "@/lib/admin-path";
import { INSTAGRAM_URL, TELEGRAM_URL } from "@/lib/brand";
import { whatsappUrl } from "@/lib/support-shared";

type Props = {
  phone: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

/** Fixed navy contact FAB — expands to WhatsApp / Instagram / Telegram */
export function WhatsAppFab({ phone }: Props) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isAdminPublicPath(pathname) || pathname.startsWith("/admin")) return null;

  const waHref = whatsappUrl(phone, "سلام؛ از سایت فرش یاقوت نقش مشهد پیام می‌دهم.");

  const actions = [
    {
      id: "telegram",
      label: "تلگرام",
      href: TELEGRAM_URL,
      className: "bg-[#2AABEE] text-white",
      icon: <IconTelegram size={22} />,
    },
    {
      id: "instagram",
      label: "اینستاگرام",
      href: INSTAGRAM_URL,
      className: "bg-[linear-gradient(135deg,#f58529_0%,#dd2a7b_45%,#8134af_100%)] text-white",
      icon: <IconInstagram size={20} />,
    },
    {
      id: "whatsapp",
      label: "واتساپ",
      href: waHref,
      className: "bg-[#25D366] text-white",
      icon: <IconWhatsApp size={22} />,
    },
  ] as const;

  return (
    <div
      ref={rootRef}
      dir="ltr"
      className="pointer-events-none fixed bottom-[calc(4.25rem+0.85rem)] left-4 z-[95] md:bottom-6 md:left-6"
    >
      <div className="relative flex flex-col items-start gap-3">
        <AnimatePresence>
          {open &&
            actions.map((action, i) => (
              <motion.a
                key={action.id}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={action.label}
                initial={{ opacity: 0, y: 14, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{
                  duration: 0.32,
                  delay: i * 0.05,
                  ease,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className={`pointer-events-auto flex items-center gap-2.5 rounded-full pe-3.5 ps-1.5 py-1.5 shadow-[0_10px_28px_rgba(11,31,58,0.22)] ring-2 ring-white/65 ${action.className}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                  {action.icon}
                </span>
                <span className="pe-1 text-[13px] font-semibold tracking-wide" dir="rtl">
                  {action.label}
                </span>
              </motion.a>
            ))}
        </AnimatePresence>

        <div className="relative">
          <motion.button
            type="button"
            aria-label={open ? "بستن منوی ارتباط" : "ارتباط با کارشناسان"}
            aria-expanded={open}
            onClick={() => {
              setShowNotif(false);
              setOpen((v) => !v);
            }}
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="pointer-events-auto relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sa-navy)] text-white shadow-[0_8px_24px_rgba(11,31,58,0.28)] ring-2 ring-white/70"
          >
            {!open && (
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-full bg-[var(--sa-navy)]/35"
                style={{ animationDuration: "2.4s" }}
              />
            )}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "chat"}
                initial={{ opacity: 0, rotate: -40, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 40, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                {open ? <IconClose size={22} /> : <IconChat size={24} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {showNotif && !open && (
              <motion.div
                role="status"
                initial={{ opacity: 0, x: -8, y: 6, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -6, y: 4, scale: 0.96 }}
                transition={{ duration: 0.45, ease }}
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
    </div>
  );
}
