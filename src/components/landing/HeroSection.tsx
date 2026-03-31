import { useTranslation, Trans } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  const { t, i18n } = useTranslation();

  return (
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
        {(t("landing.hero.tags", { returnObjects: true }) as string[]).map((feat: string) => (
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
  );
}
