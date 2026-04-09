import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "@/contexts/Providers";
import { LOCALE_STORAGE_KEY, normalizeLocaleTag } from "@/lib/locale";
import { LocaleSync } from "@/components/layout/LocaleSync";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "سداد | منصة إدارة الديون والتحصيل الذكي",
  description: "سداد - الحل الأمثل لإدارة الديون، العملاء، والتنبيهات الذكية للتحصيل المالي. نظام متكامل يدعم العربية والإنجليزية.",
  keywords: ["سداد", "إدارة ديون", "تحصيل مالي", "منصة مالية", "SADAD", "Debt Management"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = normalizeLocaleTag(cookieStore.get(LOCALE_STORAGE_KEY)?.value);

  return (
    <html
      lang={locale === "en" ? "en" : "ar"}
      dir={locale === "en" ? "ltr" : "rtl"}
      className={`${tajawal.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 font-tajawal dark:bg-slate-900 dark:text-slate-50 transition-colors" suppressHydrationWarning>
        <Providers initialLocale={locale}>
          <LocaleSync initialLocale={locale === "en" ? "en" : "ar"} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
