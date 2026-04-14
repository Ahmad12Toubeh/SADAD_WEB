import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { listPublicSubscriptionPlans, type OwnerSubscriptionPlan } from "@/lib/api";

export function PricingSection() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const [plans, setPlans] = useState<OwnerSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listPublicSubscriptionPlans()
      .then((data) => {
        if (!cancelled) setPlans(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setPlans([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const generateWhatsAppLink = (planName: string, price: number, currency: string) => {
    const phoneNumber = "962797812733";
    const text = t("landing.pricing.whatsappMessage", { plan: planName, price: `${price} ${currency}` });
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="pricing" className="py-24 px-6 bg-slate-50/60 dark:bg-slate-900/40 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto text-center">
        <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-full mb-4 inline-block">
          {t("landing.pricing.badge")}
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-secondary dark:text-white mt-4 mb-6 tracking-tight">
          {t("landing.pricing.title")}
        </h2>
        <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 mb-16 text-lg">
          {t("landing.pricing.desc")}
        </p>

        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {loading ? (
            <div className="md:col-span-3 rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-md p-12 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                {t("landing.pricing.loading")}
              </div>
            </div>
          ) : plans.length > 0 ? (
            plans.map((plan, index) => {
              const highlight = index === 0;
              const priceLabel = `${plan.price} ${plan.currency}`;
              const waLink = generateWhatsAppLink(plan.name, plan.price, plan.currency);

              return (
                <div
                  key={plan.id}
                  className={`relative group rounded-[2.5rem] p-8 border transition-all duration-700 flex flex-col overflow-hidden ${
                    highlight
                      ? "bg-slate-900 dark:bg-slate-950 text-white border-primary/40 shadow-[0_0_50px_-12px_rgba(0,163,224,0.3)] scale-105 z-10 hover:scale-[1.07] hover:shadow-primary/40"
                      : "bg-white/80 dark:bg-slate-950/40 backdrop-blur-xl border-slate-200/60 dark:border-slate-800/60 hover:border-primary/40 hover:-translate-y-2 shadow-xl shadow-slate-200/50 dark:shadow-none"
                  }`}
                >
                  {/* Decorative Shine Overlay for featured card */}
                  {highlight && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent w-full h-[200%] -translate-y-full group-hover:animate-shine"></div>
                    </div>
                  )}

                  {highlight && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-black px-4 py-1.5 rounded-b-xl uppercase tracking-widest shadow-lg animate-pulse-glow z-20">
                      {isArabic ? "الأكثر طلباً" : "Most Popular"}
                    </div>
                  )}

                  <div className="text-center mb-10 mt-4 relative">
                    <h3 className={`text-2xl font-black mb-6 ${highlight ? "text-primary" : "text-slate-900 dark:text-white"}`}>
                      {plan.name}
                    </h3>
                    
                    <div className="flex flex-col items-center">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-sm font-bold ${highlight ? "text-slate-400" : "text-slate-500"}`}>
                          {plan.currency}
                        </span>
                        <span className={`text-5xl font-black tracking-tight ${highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>
                          {plan.price}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${highlight ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary/80"}`}>
                          {isArabic ? "دفع لمرة واحدة" : "One-time payment"}
                        </span>
                        <span className={`text-xs font-medium ${highlight ? "text-slate-500" : "text-slate-400"}`}>
                          {t("landing.pricing.perMonth", { months: plan.months })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className={`text-sm mb-10 leading-relaxed font-medium text-center px-2 ${highlight ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
                    {plan.description || t("landing.pricing.defaultDesc")}
                  </p>

                  <div className="space-y-4 mb-10 flex-1 relative px-2">
                    {[
                      t("landing.pricing.features.manual"),
                      t("landing.pricing.features.trial"),
                      t("landing.pricing.features.editable"),
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm group/item">
                        <div className={`p-1 rounded-full shrink-0 transition-colors ${highlight ? "bg-primary/10" : "bg-primary/5 group-hover/item:bg-primary/10"}`}>
                          <CheckCircle2 size={14} className="text-primary" />
                        </div>
                        <span className={`font-medium transition-colors ${highlight ? "text-slate-300 group-hover/item:text-white" : "text-slate-600 dark:text-slate-300 group-hover/item:text-primary"}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    className={`w-full py-6 rounded-2xl font-black text-base transition-all active:scale-95 shadow-lg relative overflow-hidden group/btn ${
                      highlight
                        ? "bg-primary text-white hover:bg-primary/90 border-0 shadow-primary/30"
                        : "bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-primary/20 text-slate-900 dark:text-slate-100 hover:border-primary hover:shadow-primary/20"
                    }`}
                  >
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <span className="relative z-10">{t("landing.pricing.btnSubscribe")}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 -translate-x-full group-hover/btn:animate-shine pointer-events-none"></div>
                    </a>
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-3 rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-md p-12 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
              {t("landing.pricing.empty")}
            </div>
          )}
        </div>

        <div className="mt-16 text-center animate-bounce">
          <Link
            href="/register"
            className="text-primary dark:text-primary font-bold hover:underline transition-all flex items-center justify-center gap-2 text-sm"
          >
            {t("landing.pricing.btnTry")}
            {isArabic ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </Link>
        </div>
      </div>
    </section>
  );
}
