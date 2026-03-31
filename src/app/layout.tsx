import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "@/contexts/Providers";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "سداد | منصة إدارة الديون والتحصيل الذكي",
  description: "سداد - الحل الأمثل لإدارة الديون، العملاء، والتنبيهات الذكية للتحصيل المالي. نظام متكامل يدعم العربية والإنجليزية.",
  keywords: ["سداد", "إدارة ديون", "تحصيل مالي", "منصة مالية", "SADAD", "Debt Management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 font-tajawal dark:bg-slate-900 dark:text-slate-50 transition-colors" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
