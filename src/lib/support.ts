import "server-only";
import { getSiteSetting } from "@/lib/cms";
import { SUPPORT_FALLBACK, type SupportInfo } from "@/lib/support-shared";

export async function getSupportPhone(): Promise<SupportInfo> {
  const s = await getSiteSetting<SupportInfo & { city?: string }>("support", SUPPORT_FALLBACK);
  return {
    phone: s.phone || SUPPORT_FALLBACK.phone,
    phoneDisplay: s.phoneDisplay || s.phone || SUPPORT_FALLBACK.phoneDisplay,
  };
}
