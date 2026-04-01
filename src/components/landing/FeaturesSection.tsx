import { useTranslation } from "react-i18next";
import { ShieldCheck, Bell, BarChart2, Users, Zap, Star } from "lucide-react";

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-24 px-6 bg-slate-50/60 dark:bg-slate-900/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-full">
            {t("landing.features.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-secondary dark:text-white mt-4 mb-4">
            {t("landing.features.title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {t("landing.features.desc")}
          </p>
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
            <div
              key={feat.title}
              className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg text-start"
            >
              <div className={`w-12 h-12 ${feat.color} rounded-xl flex items-center justify-center mb-4`}>
                <feat.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">{feat.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
