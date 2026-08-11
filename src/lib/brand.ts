import { absoluteUrl, siteUrl } from "@/lib/site-url";

export const BRAND_NAME = "فرش یاقوت نقش مشهد";
export const BRAND_SHORT = "فرش یاقوت";
export const BRAND_ALT_NAMES = ["فرش یاقوت", "یاقوت نقش مشهد"] as const;

export const BRAND_ADDRESS = {
  streetAddress: "شهرک سلیمان صباحی",
  addressLocality: "آران و بیدگل",
  addressRegion: "اصفهان",
  addressCountry: "IR",
} as const;

export const BRAND_AREA_SERVED = ["آران و بیدگل", "کاشان", "ایران"] as const;

export const INSTAGRAM_HANDLE = "yaghoot._carpet";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;
export const TELEGRAM_URL = "https://t.me/yaghootmashhadd";

/** Shared LocalBusiness / Store JSON-LD for homepage and about. */
export function localBusinessJsonLd(opts?: { telephone?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": ["Store", "Organization"],
    name: BRAND_NAME,
    alternateName: [...BRAND_ALT_NAMES],
    url: siteUrl(),
    logo: absoluteUrl("/brand/logo.png"),
    image: absoluteUrl("/brand/logo.png"),
    telephone: opts?.telephone || undefined,
    sameAs: [INSTAGRAM_URL, TELEGRAM_URL],
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND_ADDRESS.streetAddress,
      addressLocality: BRAND_ADDRESS.addressLocality,
      addressRegion: BRAND_ADDRESS.addressRegion,
      addressCountry: BRAND_ADDRESS.addressCountry,
    },
    areaServed: BRAND_AREA_SERVED.map((name) => ({
      "@type": "Place",
      name,
    })),
  };
}
