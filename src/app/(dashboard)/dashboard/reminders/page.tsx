"use client";

import { Bell, Send, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRemindersOverdue, getRemindersSent, getRemindersUpcoming, sendReminder } from "@/lib/api";

function WhatsAppIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

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

  const handleSend = async (installmentId: string, channel: "whatsapp" | "sms") => {
    if (!installmentId) return;
    try {
      await sendReminder({ installmentId, channel });
      const sent = await getRemindersSent();
      setSentItems(sent.items ?? []);
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to send reminder");
    }
  };

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

      {/* Overdue Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-red-500" />
          <h2 className="text-lg font-bold text-red-700 dark:text-red-500">
            {t("reminders.overdue.title")} ({overdueItems.length})
          </h2>
        </div>
        <div className="space-y-3">
          {(isLoading ? [] : overdueItems).map((item) => (
            <Card key={item.installmentId ?? item.id} className="border-red-100 dark:border-red-900/30 bg-red-50/40 dark:bg-red-900/10 rounded-xl shadow-sm">
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 font-bold">
                    {item.dueDate ? Math.max(1, Math.ceil((Date.now() - new Date(item.dueDate).getTime()) / (1000 * 60 * 60 * 24))) : "!"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.customerName ?? "-"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t("analytics.charts.status.late")} — {t("debts.new.s2.amount")}: <span className="font-bold">{(item.amount ?? 0).toLocaleString()} {t("dashboard.currency")}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="gap-2 bg-[#25D366] hover:bg-[#20b558] text-white shadow-sm shadow-green-500/20"
                    onClick={() => handleSend(item.installmentId ?? item.id, "whatsapp")}
                  >
                    <WhatsAppIcon />
                    {t("reminders.actions.whatsapp")}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 dark:border-slate-700"
                    onClick={() => handleSend(item.installmentId ?? item.id, "sms")}
                  >
                    <Send size={14} />
                    {t("reminders.actions.sms")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
              title={t("guarantor.page.list.empty")}
              description={t("reminders.overdue.title")}
            />
          )}
        </div>
      </div>

      {/* Upcoming Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-orange-500" />
          <h2 className="text-lg font-bold text-orange-700 dark:text-orange-400">
            {t("reminders.upcoming.title")} ({upcomingItems.length})
          </h2>
        </div>
        <div className="space-y-3">
          {(isLoading ? [] : upcomingItems).map((item) => (
            <Card key={item.installmentId ?? item.id} className="border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10 rounded-xl shadow-sm">
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{item.customerName ?? "-"}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("reminders.upcoming.title")} — {t("debts.new.s2.amount")}: <span className="font-bold">{(item.amount ?? 0).toLocaleString()} {t("dashboard.currency")}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="gap-2 bg-[#25D366] hover:bg-[#20b558] text-white"
                    onClick={() => handleSend(item.installmentId ?? item.id, "whatsapp")}
                  >
                    <WhatsAppIcon />
                    {t("reminders.actions.preAlert")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
              title={t("guarantor.page.list.empty")}
              description={t("reminders.upcoming.title")}
            />
          )}
        </div>
      </div>

      {/* Sent Reminders */}
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
                    <p className="font-bold text-slate-800 dark:text-white">{item.customer ?? "—"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.channel} — {item.sentAt ?? "—"}
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
              title={t("guarantor.page.list.empty")}
              description={t("reminders.sent.title")}
            />
          )}
        </div>
      </div>
    </div>
  );
}


