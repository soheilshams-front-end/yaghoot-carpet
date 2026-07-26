"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSiteSettingAction } from "@/lib/admin/actions";
import { AdminHeader } from "@/components/admin/AdminShell";

type Support = { phone: string; phoneDisplay: string; city: string };
type Footer = { about: string; links?: unknown };
type Hero = { eyebrow: string; headline: string };

const inp =
  "w-full rounded-xl border border-[var(--sa-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--sa-gold)]";

export function AdminSettingsClient({
  support,
  footer,
  hero,
}: {
  support: Support;
  footer: Footer;
  hero: Hero;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [s, setS] = useState(support);
  const [f, setF] = useState(footer);
  const [h, setH] = useState(hero);

  function saveAll() {
    start(async () => {
      const a = await saveSiteSettingAction("support", s);
      const b = await saveSiteSettingAction("footer", f);
      const c = await saveSiteSettingAction("hero", h);
      if (!a.ok || !b.ok || !c.ok) {
        setMsg("خطا در ذخیره");
        return;
      }
      setMsg("تنظیمات ذخیره شد");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <AdminHeader title="تنظیمات سایت" subtitle="پشتیبانی، هیرو و فوتر — بدون پیچیدگی" />

      <section className="space-y-3 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4">
        <h3 className="text-sm font-bold">پشتیبانی</h3>
        <label className="block text-sm">
          <span className="mb-1 block">شماره (لاتین)</span>
          <input value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} className={inp} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">نمایش شماره</span>
          <input value={s.phoneDisplay} onChange={(e) => setS({ ...s, phoneDisplay: e.target.value })} className={inp} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">شهر</span>
          <input value={s.city} onChange={(e) => setS({ ...s, city: e.target.value })} className={inp} />
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4">
        <h3 className="text-sm font-bold">هیرو</h3>
        <label className="block text-sm">
          <span className="mb-1 block">برچسب بالا</span>
          <input value={h.eyebrow} onChange={(e) => setH({ ...h, eyebrow: e.target.value })} className={inp} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">عنوان اصلی</span>
          <input value={h.headline} onChange={(e) => setH({ ...h, headline: e.target.value })} className={inp} />
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--sa-border)] bg-[var(--sa-bg)] p-4">
        <h3 className="text-sm font-bold">فوتر</h3>
        <label className="block text-sm">
          <span className="mb-1 block">متن درباره</span>
          <textarea rows={4} value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} className={inp} />
        </label>
      </section>

      {msg && <p className="text-sm">{msg}</p>}
      <button
        type="button"
        disabled={pending}
        onClick={saveAll}
        className="h-11 w-full rounded-xl bg-[var(--sa-gold)] text-sm font-semibold disabled:opacity-50"
      >
        {pending ? "…" : "ذخیره تنظیمات"}
      </button>
    </div>
  );
}
