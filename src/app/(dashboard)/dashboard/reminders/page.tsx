"use client";

import { Bell, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRemindersOverdue, getRemindersSent, getRemindersUpcoming } from "@/lib/api";
import { ReminderActions } from "@/components/reminders/ReminderActions";

export default function RemindersPage() {
  const { t, i18n } = useTranslation();
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<any[]>([]);
  const [sentItems, setSentItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overdue, upcoming, sent] = await Promise.all([
        getRemindersOverdue(),
        getRemindersUpcoming(7),
        getRemindersSent(),
      ]);
      setOverdueItems(overdue.items ?? []);
      setUpcomingItems(upcoming.items ?? []);
      setSentItems(sent.items ?? []);
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to load reminders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [t]);

  const dayMs = 1000 * 60 * 60 * 24;

  const getOverdueDays = (dueDate?: string) => {
    if (!dueDate) return 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.max(1, Math.ceil((today.getTime() - due.getTime()) / dayMs));
  };

  const getUpcomingDays = (dueDate?: string) => {
    if (!dueDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((due.getTime() - today.getTime()) / dayMs));
  };

  const formatOverdueText = (days: number) =>
    i18n.language.startsWith("ar") ? `متأخرة منذ ${days} يوم` : `${days} day(s) overdue`;

  const formatUpcomingText = (days: number) =>
    i18n.language.startsWith("ar") ? `متبقي ${days} يوم` : `${days} day(s) remaining`;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("reminders.page.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{t("reminders.page.subtitle")}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-red-500" />
          <h2 className="text-lg font-bold text-red-700 dark:text-red-500">
            {t("reminders.overdue.title")} ({overdueItems.length})
          </h2>
        </div>
        <div className="space-y-3">
          {(isLoading ? [] : overdueItems).map((item) => {
            const daysOverdue = getOverdueDays(item.dueDate);
            return (
              <Card key={item.installmentId ?? item.id} className="border-red-100 dark:border-red-900/30 bg-red-50/40 dark:bg-red-900/10 rounded-xl shadow-sm">
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 font-bold">
                      {daysOverdue}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.customerName ?? "-"}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatOverdueText(daysOverdue)} - {t("debts.new.s2.amount")}: <span className="font-bold">{(item.amount ?? 0).toLocaleString()} {t("dashboard.currency")}</span>
                      </p>
                    </div>
                  </div>
                  <ReminderActions
                    installmentId={item.installmentId ?? item.id}
                    customerName={item.customerName}
                    customerEmail={item.customerEmail}
                    onSent={async () => {
                      const sent = await getRemindersSent();
                      setSentItems(sent.items ?? []);
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={`sk-over-${i}`} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!isLoading && overdueItems.length === 0 && (
            <EmptyState
              title={t("common.noResults")}
              description={t("reminders.overdue.title")}
            />
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-orange-500" />
          <h2 className="text-lg font-bold text-orange-700 dark:text-orange-400">
            {t("reminders.upcoming.title")} ({upcomingItems.length})
          </h2>
        </div>
        <div className="space-y-3">
          {(isLoading ? [] : upcomingItems).map((item) => {
            const daysRemaining = getUpcomingDays(item.dueDate);
            return (
              <Card key={item.installmentId ?? item.id} className="border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10 rounded-xl shadow-sm">
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 font-bold">
                      {daysRemaining}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.customerName ?? "-"}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatUpcomingText(daysRemaining)} - {t("debts.new.s2.amount")}: <span className="font-bold">{(item.amount ?? 0).toLocaleString()} {t("dashboard.currency")}</span>
                      </p>
                    </div>
                  </div>
                  <ReminderActions
                    installmentId={item.installmentId ?? item.id}
                    customerName={item.customerName}
                    customerEmail={item.customerEmail}
                    onSent={async () => {
                      const sent = await getRemindersSent();
                      setSentItems(sent.items ?? []);
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={`sk-up-${i}`} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!isLoading && upcomingItems.length === 0 && (
            <EmptyState
              title={t("common.noResults")}
              description={t("reminders.upcoming.title")}
            />
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={20} className="text-green-600" />
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">{t("reminders.sent.title")}</h2>
        </div>
        <div className="space-y-3">
          {(isLoading ? [] : sentItems).map((item) => (
            <Card key={item.id} className="border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 rounded-xl shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <Bell size={18} className="text-slate-400" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{item.customer ?? "-"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.channel} - {item.sentAt ? new Date(item.sentAt).toISOString().slice(0, 16).replace("T", " ") : "-"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full">
                  {t("reminders.sent.status")}
                </span>
              </CardContent>
            </Card>
          ))}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={`sk-sent-${i}`} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!isLoading && sentItems.length === 0 && (
            <EmptyState
              title={t("common.noResults")}
              description={t("reminders.sent.title")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
