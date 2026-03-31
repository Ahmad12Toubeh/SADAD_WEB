import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function PricingSection() {
  const { t } = useTranslation();

  return (
    <section id="pricing" className="py-24 px-6 bg-slate-50/60 dark:bg-slate-900/50">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-primary font-semibold text-sm bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-full">
          {t("landing.pricing.badge")}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-secondary dark:text-white mt-4 mb-4">
          {t("landing.pricing.title")}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-14">
          {t("landing.pricing.desc")}
        </p>

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
  );
}
