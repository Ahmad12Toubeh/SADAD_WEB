"use client";

import { useTranslation } from "react-i18next";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useTheme } from "@/contexts/Providers";
import { useEffect, useMemo, useState } from "react";
import { getAnalyticsMonthly, getAnalyticsSummary } from "@/lib/api";
import { exportToCsv } from "@/lib/utils/export";

const COLORS = ["#22c55e", "#00A3E0", "#f97316", "#ef4444"];

export default function AnalyticsPage() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  const [summary, setSummary] = useState<any | null>(null);
  const [monthly, setMonthly] = useState<Array<{ year: number; month: number; debts: number; collected: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (!cancelled) setError(key ? t(key) : err?.message ?? "Failed to load analytics");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const monthlyData = useMemo(() => {
    const monthNames = [
      t("analytics.charts.months.jan"),
      t("analytics.charts.months.feb"),
      t("analytics.charts.months.mar"),
      t("analytics.charts.months.apr"),
      t("analytics.charts.months.may"),
      t("analytics.charts.months.jun"),
      t("analytics.charts.months.jul"),
      t("analytics.charts.months.aug"),
      t("analytics.charts.months.sep"),
      t("analytics.charts.months.oct"),
      t("analytics.charts.months.nov"),
      t("analytics.charts.months.dec"),
    ];
    return monthly.map((row) => ({
      name: monthNames[row.month - 1] ?? `${row.month}/${row.year}`,
      debts: row.debts,
      collected: row.collected,
    }));
  }, [monthly, t]);

  const statusData = useMemo(() => {
    // backend doesn't provide distribution yet; keep stable placeholders
    return [
      { name: t("analytics.charts.status.paid"), value: 0 },
      { name: t("analytics.charts.status.active"), value: 0 },
      { name: t("analytics.charts.status.late"), value: 0 },
      { name: t("analytics.charts.status.bad"), value: 0 },
    ];
  }, [t]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("analytics.title")}</h1>
          <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">{t("analytics.subtitle")}</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          onClick={() => exportToCsv("analytics_monthly", monthly, {
            year: "Year",
            month: "Month",
            debts: t("analytics.charts.newDebts"),
            collected: t("analytics.charts.collected"),
          } as any)}
          disabled={isLoading || monthly.length === 0}
        >
          <Download size={18} />
          {t("common.export")}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
        {[
          { label: t("analytics.kpis.rate"), value: isLoading ? "…" : "—", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: t("analytics.kpis.revenue"), value: isLoading ? "…" : `${(summary?.totalActiveDebt ?? 0).toLocaleString()} ` + t("dashboard.currency"), color: "text-primary dark:text-blue-400", bg: "bg-primary/5 dark:bg-primary/10" },
          { label: t("analytics.kpis.avg"), value: isLoading ? "…" : "—", color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-50 dark:bg-slate-800" },
          { label: t("analytics.kpis.badDebt"), value: isLoading ? "…" : `${(summary?.overdueAmount ?? 0).toLocaleString()} ` + t("dashboard.currency"), color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
        ].map((kpi) => (
          <Card key={kpi.label} className={`${kpi.bg} border-0 shadow-sm rounded-2xl`}>
            <CardContent className="p-5 text-start">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">{kpi.label}</p>
              <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Monthly Trend Chart */}
        <Card className="md:col-span-2 border-0 shadow-lg shadow-slate-200/50 dark:shadow-none dark:bg-slate-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="dark:text-white">{t("analytics.charts.trend")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} style={{ direction: "ltr" }} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDebts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A3E0" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00A3E0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#E2E8F0'} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#888'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#888'} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: theme === 'dark' ? '#fff' : '#000',
                    textAlign: i18n.dir() === 'rtl' ? 'right' : 'left'
                  }} 
                />
                <Area type="monotone" dataKey="debts" name={t("analytics.charts.newDebts")} stroke="#00A3E0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDebts)" />
                <Area type="monotone" dataKey="collected" name={t("analytics.charts.collected")} stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCollected)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-none dark:bg-slate-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="dark:text-white">{t("analytics.charts.statusDistrib")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#fff' : '#000'
                  }} 
                />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ color: theme === 'dark' ? '#cbd5e1' : '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
