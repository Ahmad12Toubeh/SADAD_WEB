"use client";

import { Bell, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRemindersOverdue, getRemindersUpcoming } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

const MAX_OVERDUE = 5;
const MAX_UPCOMING = 3;

type InstallmentRow = {
  installmentId?: string;
  debtId?: string;
  id?: string;
  customerName?: string | null;
  amount?: number;
  dueDate?: string;
};

export function HeaderNotifications() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overdueItems, setOverdueItems] = useState<InstallmentRow[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<InstallmentRow[]>([]);
  const [attentionTotal, setAttentionTotal] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (mode: "full" | "quiet" = "full") => {
    if (mode === "full") setLoading(true);
    try {
      const [overdue, upcoming] = await Promise.all([getRemindersOverdue(), getRemindersUpcoming(7)]);
      const o = (overdue.items ?? []) as InstallmentRow[];
      const u = (upcoming.items ?? []) as InstallmentRow[];
      setOverdueItems(o);
      setUpcomingItems(u);
      setAttentionTotal(o.length + u.length);
    } catch {
      setOverdueItems([]);
      setUpcomingItems([]);
      setAttentionTotal(0);
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

  const dayMs = 86_400_000;
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
    i18n.language.startsWith("ar") ? `متبقي ${days} يوم` : `${days} day(s) left`;

  const totalAttention = overdueItems.length + upcomingItems.length;
  const showDot = attentionTotal > 0;

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) void load("quiet");
      return next;
    });
  };

  const sliceOverdue = overdueItems.slice(0, MAX_OVERDUE);
  const sliceUpcoming = upcomingItems.slice(0, MAX_UPCOMING);
  const curr = t("dashboard.currency");

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
        {showDot && (
          <span
            className="absolute top-1 start-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-slate-900"
            aria-hidden
          />
        )}
      </button>

      {open && (
        <div
          className="absolute end-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),20rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
          role="dialog"
          aria-label={t("header.notifications.title")}
        >
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("header.notifications.title")}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("header.notifications.subtitle")}</p>
          </div>

          <div className="max-h-[min(70vh,24rem)] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : totalAttention === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {t("header.notifications.empty")}
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sliceOverdue.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                      <AlertTriangle size={14} />
                      {t("reminders.overdue.title")}
                    </div>
                    <ul className="space-y-1">
                      {sliceOverdue.map((item, idx) => {
                        const key = item.installmentId ?? item.id ?? `od-${idx}`;
                        const days = getOverdueDays(item.dueDate);
                        const href = item.debtId ? `/dashboard/debts/${item.debtId}` : "/dashboard/reminders";
                        return (
                          <li key={key}>
                            <Link
                              href={href}
                              onClick={() => setOpen(false)}
                              className="block rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {item.customerName ?? "—"}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {formatOverdueText(days)} · {(item.amount ?? 0).toLocaleString()} {curr}
                              </p>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {sliceUpcoming.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                      <Clock size={14} />
                      {t("reminders.upcoming.title")}
                    </div>
                    <ul className="space-y-1">
                      {sliceUpcoming.map((item, idx) => {
                        const key = item.installmentId ?? item.id ?? `up-${idx}`;
                        const days = getUpcomingDays(item.dueDate);
                        const href = item.debtId ? `/dashboard/debts/${item.debtId}` : "/dashboard/reminders";
                        return (
                          <li key={key}>
                            <Link
                              href={href}
                              onClick={() => setOpen(false)}
                              className="block rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/20"
                            >
                              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {item.customerName ?? "—"}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {formatUpcomingText(days)} · {(item.amount ?? 0).toLocaleString()} {curr}
                              </p>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-2 dark:border-slate-800">
            <Link
              href="/dashboard/reminders"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary/5 dark:text-blue-400 dark:hover:bg-primary/10"
            >
              {t("header.notifications.viewAll")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
