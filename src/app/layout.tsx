import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll } from "@/components/SmoothScroll";
import { MobileTabBar } from "@/components/MobileTabBar";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "فرش یاقوت | فروشگاه فرش لوکس",
  description: "فروشگاه فرش یاقوت — خرید آنلاین، داشبورد خریدار و پنل مدیریت",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <SmoothScroll />
          <div className="sa-page flex flex-1 flex-col pb-[4.25rem] md:pb-0">
            <main className="sa-stack flex flex-1 flex-col">{children}</main>
            <SiteFooter />
          </div>
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
