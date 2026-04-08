"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/Providers";
import { ArrowLeft, ArrowRight, ShieldCheck, Globe, Moon, Sun } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { persistLocalePreference } from "@/lib/locale";

import { HeroSection } from "@/components/landing/HeroSection";
import { BrandName } from "@/components/layout/BrandLogo";

const FeaturesSection = dynamic(() => import("@/components/landing/FeaturesSection").then((m) => m.FeaturesSection));
const HowItWorksSection = dynamic(() => import("@/components/landing/HowItWorksSection").then((m) => m.HowItWorksSection));
const PricingSection = dynamic(() => import("@/components/landing/PricingSection").then((m) => m.PricingSection));
const SupportSection = dynamic(() => import("@/components/landing/SupportSection").then((m) => m.SupportSection));

export default function Home() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    void i18n.changeLanguage(newLang);
    persistLocalePreference(newLang);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg text-primary">
            <ShieldCheck size={28} />
          </div>
          <BrandName size="lg" />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-primary transition-colors">{t("landing.nav.features")}</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">{t("landing.nav.howItWorks")}</a>
          <a href="#pricing" className="hover:text-primary transition-colors">{t("landing.nav.pricing")}</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-primary transition-colors">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
          </button>
          <button onClick={toggleLanguage} className="p-2 text-slate-500 hover:text-primary transition-colors flex items-center gap-1 font-bold text-xs uppercase">
            <Globe size={20} />
            <span className="hidden sm:inline-block bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{i18n.language === "ar" ? "EN" : "AR"}</span>
          </button>
          
          <Link href="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" className="text-secondary dark:text-slate-200">{t("landing.nav.login")}</Button>
          </Link>
          <Link href="/register">
            <Button>{t("landing.nav.start")}</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <SupportSection />

        {/* CTA Footer */}
        <section className="py-20 px-6 bg-secondary text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{t("landing.cta.title")}</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">{t("landing.cta.desc")}</p>
          <Link href="/register">
            <Button size="lg" className="gap-2 px-10 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30">
              {t("landing.cta.btn")}
              {i18n.dir() === 'rtl' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-100 dark:border-slate-800 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-400 dark:text-slate-500">
        <span>{t("landing.footer.rights")}</span>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-primary transition-colors">{t("landing.footer.login")}</Link>
          <Link href="/register" className="hover:text-primary transition-colors">{t("landing.footer.register")}</Link>
        </div>
      </footer>
    </div>
  );
}
