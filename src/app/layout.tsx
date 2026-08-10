import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll } from "@/components/SmoothScroll";
import { MobileTabBar } from "@/components/MobileTabBar";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { getSupportPhone } from "@/lib/support";
import "./globals.css";

const iran = localFont({
  src: [
    // One step heavier than nominal CSS weight for a denser Persian UI
    { path: "../fonts/iran/IRAN_SemiBold.woff2", weight: "400", style: "normal" },
    { path: "../fonts/iran/IRAN_SemiBold.woff2", weight: "500", style: "normal" },
    { path: "../fonts/iran/IRANBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/iran/IRANBlack.woff2", weight: "700", style: "normal" },
    { path: "../fonts/iran/IRANBlack.woff2", weight: "800", style: "normal" },
    { path: "../fonts/iran/IRANBlack.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-iran",
  display: "swap",
});

const nastaliq = localFont({
  src: "../fonts/nastaliq/IranNastaliq.woff2",
  variable: "--font-nastaliq",
  display: "swap",
  weight: "400",
  style: "normal",
  adjustFontFallback: false,
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://yaghootcarpet.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "فرش یاقوت | فروشگاه فرش لوکس",
    template: "%s | فرش یاقوت",
  },
  description: "فروشگاه فرش یاقوت — خرید آنلاین فرش دستباف و ماشینی لوکس",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: siteUrl,
    siteName: "فرش یاقوت",
    title: "فرش یاقوت | فروشگاه فرش لوکس",
    description: "فروشگاه فرش یاقوت — خرید آنلاین فرش دستباف و ماشینی لوکس",
    images: [{ url: "/brand/logo.png", alt: "فرش یاقوت" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "فرش یاقوت | فروشگاه فرش لوکس",
    description: "فروشگاه فرش یاقوت — خرید آنلاین فرش دستباف و ماشینی لوکس",
    images: ["/brand/logo.png"],
  },
  icons: {
    icon: { url: "/favicon.png", type: "image/png" },
    apple: { url: "/apple-icon.png", type: "image/png" },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const support = await getSupportPhone();

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${iran.variable} ${nastaliq.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <SmoothScroll />
          <div className="sa-page flex flex-1 flex-col pb-[4.25rem] md:pb-0">
            <main className="sa-stack flex flex-1 flex-col">{children}</main>
            <SiteFooter />
          </div>
          <MobileTabBar />
          <WhatsAppFab phone={support.phone} />
        </Providers>
      </body>
    </html>
  );
}
