"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/Providers";
import { getAnalyticsMonthly, getAnalyticsSummary } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Wallet, CreditCard, Activity } from "lucide-react";

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalActiveDebt: number;
    collectedThisMonth: number;
    overdueAmount: number;
    activeCustomers: number;
    currency: string;
  } | null>(null);
  const [monthly, setMonthly] = useState<Array<{ year: number; month: number; debts: number; collected: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [s, m] = await Promise.all([getAnalyticsSummary(), getAnalyticsMonthly(6)]);
        if (cancelled) return;
        setSummary(s);
        setMonthly(m.items ?? []);
      } catch (err: any) {
        const key = err?.messageKey as string | undefined;
        if (!cancelled) setError(key ? t(key) : err?.message ?? "Failed to load dashboard");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const trendData = useMemo(() => {
    const monthNames = [
      t("analytics.charts.months.jan"),
      t("analytics.charts.months.feb"),
      t("analytics.charts.months.mar"),
      t("analytics.charts.months.apr"),
      t("analytics.charts.months.may"),
      t("analytics.charts.months.jun"),
    ];
    return monthly.map((row) => ({
      name: monthNames[(row.month - 1) % 6] ?? `${row.month}/${row.year}`,
      total: row.debts,
      collected: row.collected,
    }));
  }, [monthly, t]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("dashboard.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{t("dashboard.subtitle")}</p>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("dashboard.totalActiveDebt")}</CardTitle>
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Wallet size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "…" : (summary?.totalActiveDebt ?? 0).toLocaleString()}{" "}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("dashboard.currency")}</span>
            </div>
            <p className="text-xs text-red-500 flex items-center mt-1">
              <ArrowUpRight size={14} className="mr-1" /> {t("dashboard.upFromLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("dashboard.collectedThisMonth")}</CardTitle>
            <div className="bg-green-500/10 p-2 rounded-lg text-green-600 dark:bg-green-500/20 dark:text-green-400">
              <Activity size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "…" : (summary?.collectedThisMonth ?? 0).toLocaleString()}{" "}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("dashboard.currency")}</span>
            </div>
             <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
              <ArrowUpRight size={14} className="mr-1" /> {t("dashboard.upCollected")}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("dashboard.badDebt")}</CardTitle>
             <div className="bg-orange-500/10 p-2 rounded-lg text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <CreditCard size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "…" : (summary?.overdueAmount ?? 0).toLocaleString()}{" "}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("dashboard.currency")}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
              <ArrowDownRight size={14} className="mr-1" /> {t("dashboard.needsFollowUp")}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("dashboard.activeCustomers")}</CardTitle>
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Users size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "…" : (summary?.activeCustomers ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("dashboard.newCustomers")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="dark:text-white">{t("dashboard.cashflowChart")}</CardTitle>
          </CardHeader>
           <CardContent className="px-2 h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} style={{ direction: 'ltr' }}>
                 <defs>
                   <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#00A3E0" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#00A3E0" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#E2E8F0'} />
                 <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#888888'} fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#888888'} fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', 
                     border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                     borderRadius: '8px',
                     color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                     textAlign: i18n.dir() === 'rtl' ? 'right' : 'left'
                   }} 
                 />
                 <Area type="monotone" dataKey="total" name={t("dashboard.totalActiveDebt")} stroke="#00A3E0" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
               </AreaChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>

        <Card className="col-span-1 border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="dark:text-white">{t("dashboard.collectionChart")}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} style={{ direction: 'ltr' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#E2E8F0'} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#888888'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#888888'} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#334155' : '#f1f5f9' }}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', 
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    textAlign: i18n.dir() === 'rtl' ? 'right' : 'left'
                  }} 
                />
                <Bar dataKey="collected" name={t("dashboard.collectedThisMonth")} fill="#00A3E0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
