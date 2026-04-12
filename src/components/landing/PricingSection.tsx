import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
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

        <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-primary/15 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm dark:border-primary/20 dark:bg-slate-950 dark:text-slate-300">
          {isArabic
            ? "الأسعار هنا هي الخطط المنشورة من لوحة المالك. أي خطة تنشأ وتكون مفعلة ستظهر تلقائيا للمستخدمين هنا."
            : "These prices come directly from the owner dashboard. Any active plan you create will appear here automatically."}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {loading ? (
            <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              {isArabic ? "جار تحميل الخطط..." : "Loading plans..."}
            </div>
          ) : plans.length > 0 ? (
            plans.map((plan, index) => {
              const highlight = index === 0;
              const priceLabel = `${plan.price} ${plan.currency}`;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-8 border text-start flex flex-col ${highlight ? "bg-secondary dark:bg-slate-800 text-white border-secondary dark:border-primary shadow-2xl shadow-secondary/20 dark:shadow-primary/10 scale-105" : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm"}`}
                >
                  <p className={`font-bold text-lg mb-2 ${highlight ? "text-slate-300 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                    {plan.name}
                  </p>
                  <p className={`text-4xl font-black mb-1 flex items-baseline gap-1 ${highlight ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>
                    {priceLabel}
                    <span className={`text-base font-medium ${highlight ? "text-slate-300 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"}`}>
                      {isArabic ? ` / ${plan.months} شهر` : ` / ${plan.months} months`}
                    </span>
                  </p>
                  {plan.description ? (
                    <p className={`text-sm mb-4 ${highlight ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                      {plan.description}
                    </p>
                  ) : (
                    <p className={`text-sm mb-4 ${highlight ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                      {isArabic ? "خطة اشتراك مفعلة من لوحة المالك" : "Active plan from the owner dashboard"}
                    </p>
                  )}

                  <ul className="mt-2 space-y-3 flex-1">
                    <li className={`flex items-center gap-2 text-sm ${highlight ? "text-slate-200 dark:text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                      <CheckCircle2 size={16} className={highlight ? "text-primary" : "text-green-500"} />
                      {isArabic ? "الاشتراك ينفذ عبر صاحب المشروع" : "Subscription is activated by the owner"}
                    </li>
                    <li className={`flex items-center gap-2 text-sm ${highlight ? "text-slate-200 dark:text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                      <CheckCircle2 size={16} className={highlight ? "text-primary" : "text-green-500"} />
                      {isArabic ? "تجربة مجانية 7 أيام قبل التفعيل" : "7-day free trial before activation"}
                    </li>
                    <li className={`flex items-center gap-2 text-sm ${highlight ? "text-slate-200 dark:text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                      <CheckCircle2 size={16} className={highlight ? "text-primary" : "text-green-500"} />
                      {isArabic ? "يمكن تعديل الخطة من لوحة المالك" : "Plan can be edited in owner dashboard"}
                    </li>
                  </ul>

                  <Button asChild className={`mt-8 sm:hidden w-full ${highlight ? "bg-primary hover:bg-primary/90 text-white" : "dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"}`} variant={highlight ? "primary" : "outline"}>
                    <Link href="/login">
                      {isArabic ? "ابدأ التجربة" : "Start Trial"}
                    </Link>
                  </Button>
                  <Button asChild className={`mt-8 hidden sm:inline-flex w-full ${highlight ? "bg-primary hover:bg-primary/90 text-white" : "dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"}`} variant={highlight ? "primary" : "outline"}>
                    <Link href="/register">
                      {isArabic ? "ابدأ التجربة" : "Start Trial"}
                    </Link>
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              {isArabic ? "لا توجد خطط مفعلة حاليا." : "No active plans available right now."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
