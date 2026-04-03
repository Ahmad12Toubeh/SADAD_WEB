"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const COLORS = ["#22c55e", "#00A3E0", "#f97316", "#ef4444"];

type MonthlyPoint = {
  name: string;
  debts: number;
  collected: number;
};

type StatusPoint = {
  name: string;
  value: number;
};

type Props = {
  monthlyData: MonthlyPoint[];
  statusData: StatusPoint[];
  theme: "light" | "dark";
  isRtl: boolean;
  trendTitle: string;
  statusTitle: string;
  debtsLabel: string;
  collectedLabel: string;
};

export default function AnalyticsCharts({
  monthlyData,
  statusData,
  theme,
  isRtl,
  trendTitle,
  statusTitle,
  debtsLabel,
  collectedLabel,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="min-w-0 rounded-2xl border-0 shadow-lg shadow-slate-200/50 dark:bg-slate-800 dark:shadow-none md:col-span-2">
        <CardHeader>
          <CardTitle className="dark:text-white">{trendTitle}</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 px-2">
          <div className="h-[260px] min-w-0 sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#334155" : "#E2E8F0"} />
              <XAxis dataKey="name" stroke={theme === "dark" ? "#94a3b8" : "#888"} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={theme === "dark" ? "#94a3b8" : "#888"} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
                  border: "none",
                  borderRadius: "8px",
                  color: theme === "dark" ? "#fff" : "#000",
                  textAlign: isRtl ? "right" : "left",
                }}
              />
              <Area type="monotone" dataKey="debts" name={debtsLabel} stroke="#00A3E0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDebts)" />
              <Area type="monotone" dataKey="collected" name={collectedLabel} stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCollected)" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0 rounded-2xl border-0 shadow-lg shadow-slate-200/50 dark:bg-slate-800 dark:shadow-none">
        <CardHeader>
          <CardTitle className="dark:text-white">{statusTitle}</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="flex h-[260px] min-w-0 items-center justify-center sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="45%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
                  border: "none",
                  borderRadius: "8px",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ color: theme === "dark" ? "#cbd5e1" : "#475569" }} />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
