"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Clock3 } from "lucide-react";
import { getCurrentSubscriptionStatus, type SubscriptionStatusSummary } from "@/lib/api";

export function SubscriptionStatusBanner() {
  const [subscription, setSubscription] = useState<SubscriptionStatusSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrentSubscriptionStatus()
      .then((data) => {
        if (!cancelled) setSubscription(data);
      })
      .catch(() => {
        if (!cancelled) setSubscription(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!subscription || subscription.stage === "expired") {
    return null;
  }

  const locale = typeof document !== "undefined" ? document.documentElement.lang || "ar" : "ar";
  const isArabic = locale.startsWith("ar");
  const endDate = subscription.trialEndsAt ?? subscription.subscriptionEndsAt;
  const formattedDate = endDate ? new Date(endDate).toLocaleDateString(isArabic ? "ar-JO" : "en-US") : null;

  if (subscription.stage === "active") {
    return (
      <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-0.5 shrink-0" size={18} />
          <div className="min-w-0">
            <p className="font-semibold">
              {isArabic ? "اشتراكك مفعل حالياً" : "Your subscription is active"}
            </p>
            <p className="mt-1 text-emerald-800 dark:text-emerald-200">
              {isArabic
                ? `الخطة الحالية${subscription.subscriptionPlanLabel ? `: ${subscription.subscriptionPlanLabel}` : ""}${formattedDate ? ` وتنتهي بتاريخ ${formattedDate}` : ""}.`
                : `Your current plan${subscription.subscriptionPlanLabel ? `: ${subscription.subscriptionPlanLabel}` : ""}${formattedDate ? ` ends on ${formattedDate}` : ""}.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100">
      <div className="flex items-start gap-3">
        {subscription.showExpiryWarning ? (
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
        ) : (
          <Clock3 className="mt-0.5 shrink-0" size={18} />
        )}
        <div className="min-w-0">
          <p className="font-semibold">
            {subscription.showExpiryWarning
              ? isArabic
                ? "تنبيه مهم: التجربة المجانية قاربت على الانتهاء"
                : "Important: your free trial is about to end"
              : isArabic
                ? "أنت الآن داخل التجربة المجانية"
                : "You are currently on the free trial"}
          </p>
          <p className="mt-1 text-amber-900 dark:text-amber-100">
            {isArabic
              ? `متبقي ${subscription.daysRemaining} يوم من أصل 7 أيام.${formattedDate ? ` ينتهي الوصول بتاريخ ${formattedDate}.` : ""} إذا رغبت بالاستمرار، التواصل معنا لتفعيل اشتراك شهري أو حسب المدة المطلوبة.`
              : `${subscription.daysRemaining} day(s) remain from your 7-day trial.${formattedDate ? ` Access ends on ${formattedDate}.` : ""} To continue, contact us to activate a monthly or custom-duration subscription.`}
          </p>
          <Link
            href="/dashboard/settings"
            className="mt-2 inline-flex text-sm font-semibold text-amber-950 underline underline-offset-4 dark:text-amber-100"
          >
            {isArabic ? "عرض تفاصيل الاشتراك" : "View subscription details"}
          </Link>
        </div>
      </div>
    </div>
  );
}
