"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/Providers";
import { persistLocalePreference } from "@/lib/locale";
import { ShieldCheck, Moon, Sun, Globe, ArrowLeft, ArrowRight } from "lucide-react";
import { BrandLogo, BrandName } from "@/components/layout/BrandLogo";

export function AuthNavbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    void i18n.changeLanguage(newLang);
    persistLocalePreference(newLang);
  };

  const goHome = () => {
    window.location.assign("/");
  };

  return (
    <header className="absolute top-0 w-full z-50 px-6 py-4 flex items-center justify-between">
      <button type="button" onClick={goHome} className="flex items-center gap-3 text-secondary dark:text-white">
        <BrandLogo />
      </button>

      <div className="flex items-center gap-2 md:gap-4 lg:gap-5">
        <div className="flex items-center gap-2 mr-2 rtl:ml-2 rtl:mr-0">
          <button
            onClick={toggleTheme}
            title={theme === "light" ? t("sidebar.darkMode") : t("sidebar.lightMode")}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
          </button>

          <button
            onClick={toggleLanguage}
            title={t("sidebar.language")}
            className="h-9 md:h-10 px-3 md:px-4 flex items-center gap-2 rounded-full bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 text-primary dark:text-blue-400 transition-all font-bold text-xs md:text-sm shadow-sm border border-primary/20 dark:border-primary/30"
          >
            <Globe size={18} />
            <span className="uppercase tracking-wider">{i18n.language === "ar" ? "EN" : "AR"}</span>
          </button>
        </div>

        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            goHome();
          }}
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-5 font-semibold text-slate-700 shadow-md transition-all hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {i18n.language === "ar" ? "العودة للرئيسية" : "Back to Home"}
          {i18n.dir() === "rtl" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
        </Link>
      </div>
    </header>
  );
}
