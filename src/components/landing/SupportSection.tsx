import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SupportSection() {
  const { t } = useTranslation();

  return (
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
  );
}
