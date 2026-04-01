"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type TrendPoint = {
  name: string;
  total: number;
  collected: number;
};

type DashboardChartsProps = {
  trendData: TrendPoint[];
  theme: "light" | "dark";
  isRtl: boolean;
  cashflowTitle: string;
  collectionTitle: string;
  totalDebtLabel: string;
  collectedLabel: string;
};

export default function DashboardCharts({
  trendData,
  theme,
  isRtl,
  cashflowTitle,
  collectionTitle,
  totalDebtLabel,
  collectedLabel,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-1 border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="dark:text-white">{cashflowTitle}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} style={{ direction: "ltr" }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A3E0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00A3E0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#334155" : "#E2E8F0"} />
              <XAxis dataKey="name" stroke={theme === "dark" ? "#94a3b8" : "#888888"} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={theme === "dark" ? "#94a3b8" : "#888888"} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
                  border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
                  borderRadius: "8px",
                  color: theme === "dark" ? "#f8fafc" : "#0f172a",
                  textAlign: isRtl ? "right" : "left",
                }}
              />
              <Area type="monotone" dataKey="total" name={totalDebtLabel} stroke="#00A3E0" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="dark:text-white">{collectionTitle}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} style={{ direction: "ltr" }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#334155" : "#E2E8F0"} />
              <XAxis dataKey="name" stroke={theme === "dark" ? "#94a3b8" : "#888888"} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={theme === "dark" ? "#94a3b8" : "#888888"} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: theme === "dark" ? "#334155" : "#f1f5f9" }}
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
                  border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
                  borderRadius: "8px",
                  color: theme === "dark" ? "#f8fafc" : "#0f172a",
                  textAlign: isRtl ? "right" : "left",
                }}
              />
              <Bar dataKey="collected" name={collectedLabel} fill="#00A3E0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
