"use client";

import { Bell, CalendarClock, CheckCheck, Clock3 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getUnreadNotificationCount, listNotifications, markAllNotificationsRead, markNotificationRead, type AppNotification } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

const MAX_ITEMS = 8;

export function HeaderNotifications() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (mode: "full" | "quiet" = "full") => {
    if (mode === "full") setLoading(true);
    try {
      const [listRes, unreadRes] = await Promise.all([
        listNotifications(MAX_ITEMS),
        getUnreadNotificationCount(),
      ]);
      setItems(listRes.items ?? []);
      setUnreadCount(unreadRes.count ?? 0);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      if (mode === "full") setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load("full");
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isArabic = i18n.language.startsWith("ar");

  const relativeTime = useMemo(
    () =>
      new Intl.RelativeTimeFormat(isArabic ? "ar" : "en", {
        numeric: "auto",
        style: "short",
      }),
    [isArabic],
  );

  const formatCreatedAt = (createdAt?: string) => {
    if (!createdAt) return "";
    const diffMs = new Date(createdAt).getTime() - Date.now();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (Math.abs(diffHours) < 24) {
      return relativeTime.format(diffHours, "hour");
    }
    const diffDays = Math.round(diffHours / 24);
    return relativeTime.format(diffDays, "day");
  };

  const getCopy = (item: AppNotification) => {
    if (item.kind === "trial_expiring") {
      return {
        title: isArabic ? "انتهاء التجربة قريبًا" : "Trial ending soon",
        body: isArabic
          ? `تبقّى ${item.daysRemainingSnapshot} يوم على انتهاء التجربة المجانية. تواصل مع صاحب المشروع لتجديد الاشتراك.`
          : `Your free trial ends in ${item.daysRemainingSnapshot} day(s). Contact the owner to renew your plan.`,
        icon: CalendarClock,
        tone: "amber" as const,
      };
    }

    return {
      title: isArabic ? "انتهاء الاشتراك قريبًا" : "Subscription ending soon",
      body: isArabic
        ? `تبقّى ${item.daysRemainingSnapshot} أيام على انتهاء الاشتراك${item.subscriptionPlanLabel ? ` (${item.subscriptionPlanLabel})` : ""}.`
        : `Your subscription${item.subscriptionPlanLabel ? ` (${item.subscriptionPlanLabel})` : ""} ends in ${item.daysRemainingSnapshot} day(s).`,
      icon: Clock3,
      tone: "orange" as const,
    };
  };

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) void load("quiet");
      return next;
    });
  };

  const handleMarkRead = async (id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    setUnreadCount((current) => Math.max(0, current - 1));
    try {
      await markNotificationRead(id);
    } catch {
      void load("quiet");
    }
  };

  const handleMarkAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      void load("quiet");
    }
  };

  return (
    <div className="relative shrink-0 border-s border-slate-200 ps-3 dark:border-slate-700 sm:ps-4" ref={rootRef}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={t("header.notifications.title")}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Bell size={22} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 start-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-slate-900"
            aria-hidden
          />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-x-2 top-20 z-50 flex max-h-[min(70vh,28rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:w-[min(calc(100vw-2rem),20rem)] sm:max-h-[min(70vh,24rem)]"
          role="dialog"
          aria-label={t("header.notifications.title")}
        >
          <div className="border-b border-slate-100 px-3 py-3 sm:px-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("header.notifications.title")}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("header.notifications.subtitle")}</p>
              </div>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary dark:bg-primary/20">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
            {loading ? (
              <div className="space-y-3 p-3 sm:p-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {isArabic ? "لا توجد إشعارات حالياً." : "No notifications right now."}
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => {
                  const copy = getCopy(item);
                  const Icon = copy.icon;
                  return (
                    <Link
                      key={item.id}
                      href="/dashboard/settings"
                      onClick={async () => {
                        setOpen(false);
                        if (!item.isRead) {
                          await handleMarkRead(item.id);
                        }
                      }}
                      className={`block px-3 py-3 text-start transition-colors sm:px-4 ${item.isRead ? "hover:bg-slate-50 dark:hover:bg-white/5" : "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/15"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-xl p-2 ${copy.tone === "amber" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{copy.title}</p>
                            {!item.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            {copy.body}
                          </p>
                          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                            {formatCreatedAt(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 p-2 dark:border-slate-800">
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/5 dark:text-blue-400 dark:hover:bg-primary/10"
            >
              <CheckCheck size={16} />
              {isArabic ? "تحديد الكل كمقروء" : "Mark all read"}
            </button>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="inline-flex flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("header.notifications.viewAll")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
