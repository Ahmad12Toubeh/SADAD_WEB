"use client";

import Link from "next/link";
import { useTranslation, Trans } from "react-i18next";
import { useTheme } from "@/contexts/Providers";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, Bell, BarChart2, Users, Zap, Star, ChevronDown, Globe, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg text-primary">
            <ShieldCheck size={28} />
          </div>
          <span className="text-xl font-bold text-secondary dark:text-white">سداد</span>
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
        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-36 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 dark:bg-primary/30 rounded-full blur-3xl"
            ></motion.div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl gap-12 mt-8">
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-start">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-primary font-semibold bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-full text-sm mb-6 inline-block"
              >
                {t("landing.hero.badge")}
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-6xl font-extrabold text-secondary dark:text-slate-100 leading-tight mb-6"
              >
                {t("landing.hero.title1")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 block sm:inline">
                  {t("landing.hero.title2")}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-10"
              >
                <Trans i18nKey="landing.hero.desc" components={{ strong: <strong className="text-slate-700 dark:text-slate-200" /> }} />
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Link href="/register">
                  <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25 hover:scale-105 transition-transform active:scale-95">
                    {t("landing.hero.ctaPrimary")}
                    {i18n.dir() === 'rtl' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="gap-2 px-8 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300">
                    {t("landing.hero.ctaSecondary")}
                    <ChevronDown size={18} />
                  </Button>
                </a>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex-1 w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] relative mt-8 lg:mt-0"
            >
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
              <img 
                src="/assets/hero.png" 
                alt="SADAD Hero Illustration" 
                className="w-full h-auto drop-shadow-2xl"
              />
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-14 flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 justify-center"
          >
            {(t("landing.hero.tags", { returnObjects: true }) as string[]).map(feat => (
              <div key={feat} className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-500" />
                <span>{feat}</span>
              </div>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-300/40 dark:shadow-none"
          >
            <div className="bg-secondary dark:bg-slate-900 h-8 flex items-center gap-2 px-4">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: t("landing.hero.dashboard.active"), value: "124,500 " + t("dashboard.currency"), color: "text-primary" },
                { label: t("landing.hero.dashboard.collected"), value: "82,300 " + t("dashboard.currency"), color: "text-green-600 dark:text-green-400" },
                { label: t("landing.hero.dashboard.overdue"), value: "42,200 " + t("dashboard.currency"), color: "text-red-500 dark:text-red-400" },
              ].map(card => (
                <div key={card.label} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 text-start">
                  <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                  <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-slate-50/60 dark:bg-slate-900/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-primary font-semibold text-sm bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-full">{t("landing.features.badge")}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-secondary dark:text-white mt-4 mb-4">{t("landing.features.title")}</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t("landing.features.desc")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: t("landing.features.f1Title"),
                  desc: t("landing.features.f1Desc"),
                  color: "bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400",
                },
                {
                  icon: Bell,
                  title: t("landing.features.f2Title"),
                  desc: t("landing.features.f2Desc"),
                  color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
                },
                {
                  icon: BarChart2,
                  title: t("landing.features.f3Title"),
                  desc: t("landing.features.f3Desc"),
                  color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
                },
                {
                  icon: Zap,
                  title: t("landing.features.f4Title"),
                  desc: t("landing.features.f4Desc"),
                  color: "bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400",
                },
                {
                  icon: ShieldCheck,
                  title: t("landing.features.f5Title"),
                  desc: t("landing.features.f5Desc"),
                  color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                },
                {
                  icon: Star,
                  title: t("landing.features.f6Title"),
                  desc: t("landing.features.f6Desc"),
                  color: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
                },
              ].map((feat, idx) => (
                <motion.div 
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all text-start"
                >
                  <div className={`w-12 h-12 ${feat.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feat.icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">{feat.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 bg-white dark:bg-slate-950">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-primary font-semibold text-sm bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-full">{t("landing.howItWorks.badge")}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary dark:text-white mt-4 mb-14">{t("landing.howItWorks.title")}</h2>
            <div className="grid md:grid-cols-3 gap-8 text-start">
              {[
                { step: "1", title: t("landing.howItWorks.s1"), desc: t("landing.howItWorks.s1d") },
                { step: "2", title: t("landing.howItWorks.s2"), desc: t("landing.howItWorks.s2d") },
                { step: "3", title: t("landing.howItWorks.s3"), desc: t("landing.howItWorks.s3d") },
              ].map(item => (
                <div key={item.step} className="flex flex-col items-start gap-3">
                  <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/25">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xl">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 bg-slate-50/60 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-primary font-semibold text-sm bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-full">{t("landing.pricing.badge")}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary dark:text-white mt-4 mb-4">{t("landing.pricing.title")}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-14">{t("landing.pricing.desc")}</p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: t("landing.pricing.free"),
                  price: t("landing.pricing.freePrice"),
                  period: t("landing.pricing.period"),
                  features: [t("landing.pricing.fFree1"), t("landing.pricing.fFree2"), t("landing.pricing.fFree3")],
                  cta: t("landing.pricing.ctaFree"),
                  highlight: false,
                },
                {
                  name: t("landing.pricing.pro"),
                  price: t("landing.pricing.proPrice"),
                  period: t("landing.pricing.periodPro"),
                  features: [t("landing.pricing.fPro1"), t("landing.pricing.fPro2"), t("landing.pricing.fPro3"), t("landing.pricing.fPro4"), t("landing.pricing.fPro5")],
                  cta: t("landing.pricing.ctaPro"),
                  highlight: true,
                },
                {
                  name: t("landing.pricing.ent"),
                  price: t("landing.pricing.entPrice"),
                  period: t("landing.pricing.periodPro"),
                  features: [t("landing.pricing.fEnt1"), t("landing.pricing.fEnt2"), t("landing.pricing.fEnt3"), t("landing.pricing.fEnt4")],
                  cta: t("landing.pricing.ctaEnt"),
                  highlight: false,
                },
              ].map(plan => (
                <div key={plan.name} className={`rounded-2xl p-8 border text-start flex flex-col ${plan.highlight ? "bg-secondary dark:bg-slate-800 text-white border-secondary dark:border-primary shadow-2xl shadow-secondary/20 dark:shadow-primary/10 scale-105" : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm"}`}>
                  <p className={`font-bold text-lg mb-2 ${plan.highlight ? "text-slate-300 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>{plan.name}</p>
                  <p className={`text-4xl font-black mb-1 flex items-baseline gap-1 ${plan.highlight ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>
                    {plan.price}<span className={`text-base font-medium ${plan.highlight ? "text-slate-300 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"}`}>{plan.period}</span>
                  </p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? "text-slate-200 dark:text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                        <CheckCircle2 size={16} className={plan.highlight ? "text-primary" : "text-green-500"} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block mt-8">
                    <Button className={`w-full ${plan.highlight ? "bg-primary hover:bg-primary/90 text-white" : "dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"}`} variant={plan.highlight ? "primary" : "outline"}>
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-24 px-6 bg-white dark:bg-slate-950 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -z-10"></div>
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-16 text-start"
            >
              <div className="flex-1">
                <span className="text-primary font-semibold text-sm bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-full mb-4 inline-block">
                  {t("landing.support.badge")}
                </span>
                <h2 className="text-3xl font-extrabold text-secondary dark:text-white mb-4">
                  {t("landing.support.title")}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                  {t("landing.support.desc")}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="gap-2 px-6 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                    <Zap size={18} />
                    {t("landing.support.btn")}
                  </Button>
                  <Button variant="ghost" className="gap-2 dark:text-slate-300">
                    <Globe size={18} />
                    {t("landing.support.email")}
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 md:w-48 md:h-48 bg-primary/20 dark:bg-primary/30 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck size={64} className="text-primary md:w-24 md:h-24" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

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
