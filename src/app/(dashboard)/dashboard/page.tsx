"use client"; // force re-check

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/Providers";
import { Debt, getAnalyticsMonthly, getAnalyticsSummary, getRecentActivity } from "@/lib/api";
import Link from "next/link";

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
  const [recent, setRecent] = useState<Debt[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [s, m, r] = await Promise.all([getAnalyticsSummary(), getAnalyticsMonthly(6), getRecentActivity(5)]);
        if (cancelled) return;
        setSummary(s);
        setMonthly(m.items ?? []);
        setRecent(r);
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
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    return monthly.map((row) => ({
      name: t(`analytics.charts.months.${months[row.month - 1]}`) || `${row.month}/${row.year}`,
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

      {/* Recent Activity */}
      <Card className="border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="dark:text-white">{t("dashboard.recentActivity")}</CardTitle>
          <Link href="/dashboard/debts" className="text-sm font-medium text-primary hover:underline">
            {t("common.viewAll")}
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 font-bold">{t("customers.new.name")}</th>
                  <th className="px-6 py-3 font-bold">{t("debts.new.s2.amount")}</th>
                  <th className="px-6 py-3 font-bold">{t("debts.new.s2.type")}</th>
                  <th className="px-6 py-3 font-bold">{t("debts.new.s2.dueDate")}</th>
                  <th className="px-6 py-3 font-bold">{t("common.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recent.map((debt) => (
                  <tr key={debt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      <Link href={`/dashboard/customers/${debt.customerId}`} className="hover:text-primary hover:underline">
                         {debt.customerName || debt.customerId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 dark:text-slate-300">
                      {debt.principalAmount.toLocaleString()} {t("dashboard.currency")}
                    </td>
                    <td className="px-6 py-4 dark:text-slate-400">
                      {t(`debts.new.s2.types.${debt.type === 'invoice' ? 't1' : debt.type === 'loan' ? 't2' : 't3'}`)}
                    </td>
                    <td className="px-6 py-4 dark:text-slate-400">
                      {new Date(debt.dueDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        debt.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        debt.status === 'late' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {t(`analytics.charts.status.${debt.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">
                      {t("common.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
