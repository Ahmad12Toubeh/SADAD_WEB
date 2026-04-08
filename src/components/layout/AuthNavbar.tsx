"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/Providers";
import { ShieldCheck, Moon, Sun, Globe, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BrandName } from "@/components/layout/BrandLogo";

export function AuthNavbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = i18n.dir(newLang);
    document.documentElement.lang = newLang;
    localStorage.setItem("i18nextLng", newLang);
  };

  return (
    <header className="absolute top-0 w-full z-50 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-secondary dark:text-white"
      >
        <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl text-primary">
          <ShieldCheck size={26} />
        </div>
        <BrandName size="lg" />
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4 lg:gap-5">
        {/* Modern Toggles */}
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

        {/* Back Button */}
        <Link href="/" className="hidden sm:block">
          <Button
            variant="outline"
            className="gap-2 bg-white/90 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md transition-all hover:bg-white dark:hover:bg-slate-800 rounded-full px-5 font-semibold text-slate-700 dark:text-slate-100"
          >
            {i18n.language === "ar" ? "العودة للرئيسية" : "Back to Home"}
            {i18n.dir() === 'rtl' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </Button>
        </Link>
      </div>
    </header>
  );
}
