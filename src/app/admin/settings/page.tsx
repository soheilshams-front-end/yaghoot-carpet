import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";
import { getSiteSetting } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [support, footer, hero] = await Promise.all([
    getSiteSetting("support", {
      phone: "09124496001",
      phoneDisplay: "۰۹۱۲۴۴۹۶۰۰۱",
      city: "آران و بیدگل",
    }),
    getSiteSetting("footer", {
      about: "",
    }),
    getSiteSetting("hero", {
      eyebrow: "تجربه‌ای متفاوت",
      headline: "به سبک فرش یاقوت",
    }),
  ]);

  return <AdminSettingsClient support={support} footer={footer} hero={hero} />;
}
