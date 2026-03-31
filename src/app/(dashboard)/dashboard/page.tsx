"use client";

import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/Providers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Wallet, CreditCard, Activity } from "lucide-react";

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  // Translated Mock Data
  const trendData = [
    { name: t("analytics.charts.months.jan"), total: 4000, collected: 2400 },
    { name: t("analytics.charts.months.feb"), total: 3000, collected: 1398 },
    { name: t("analytics.charts.months.mar"), total: 6000, collected: 4800 },
    { name: t("analytics.charts.months.apr"), total: 2780, collected: 1908 },
    { name: t("analytics.charts.months.may"), total: 1890, collected: 800 },
    { name: t("analytics.charts.months.jun"), total: 2390, collected: 3800 },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("dashboard.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{t("dashboard.subtitle")}</p>
      </div>

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
            <div className="text-2xl font-bold text-slate-900 dark:text-white">124,500 <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("dashboard.currency")}</span></div>
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
            <div className="text-2xl font-bold text-slate-900 dark:text-white">82,300 <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("dashboard.currency")}</span></div>
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
            <div className="text-2xl font-bold text-slate-900 dark:text-white">42,200 <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("dashboard.currency")}</span></div>
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
            <div className="text-2xl font-bold text-slate-900 dark:text-white">342</div>
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
