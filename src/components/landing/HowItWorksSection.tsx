import { useTranslation } from "react-i18next";

export function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-primary font-semibold text-sm bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-full">
          {t("landing.howItWorks.badge")}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-secondary dark:text-white mt-4 mb-14">
          {t("landing.howItWorks.title")}
        </h2>
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
  );
}
