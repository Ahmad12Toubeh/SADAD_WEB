"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Eye, Calendar, CreditCard, Filter, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";
import { exportToCsv, exportToXlsx } from "@/lib/utils/export";

type Debt = {
  id: string;
  customerId: string;
  customerName?: string;
  principalAmount: number;
  currency: string;
  planType: "one_time" | "installments";
  status: string;
  category?: string;
  createdAt?: string;
};

export default function DebtsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiFetch<{ items: Debt[] }>("/debts");
        if (!cancelled) setItems(res.items);
      } catch (err: any) {
        const key = err?.messageKey as string | undefined;
        if (!cancelled) setError(key ? t(key) : err?.message ?? "Failed to load debts");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const filtered = items.filter((d) => 
    (d.customerName ?? "").includes(search) || 
    (d.category ?? "").includes(search) ||
    d.id.includes(search)
  );

  const exportHeaders = {
    id: t("debts.page.colId"),
    customerName: t("customers.table.customer"),
    createdAt: t("debts.page.colDate"),
    category: t("debts.page.colCategory"),
    principalAmount: t("customers.table.totalDebt"),
    currency: t("dashboard.currency"),
    status: t("customers.table.status"),
  } as const;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200";
      case "late": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200";
      case "bad": return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200";
      default: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("debts.page.title")}</h1>
          <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">{t("debts.page.subtitle")}</p>
        </div>
        <Link href="/dashboard/debts/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus size={18} />
            {t("debts.page.newDebt")}
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden dark:bg-slate-800">
        <CardHeader className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-white py-5 dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center">
          <CardTitle className="text-lg text-slate-900 dark:text-white">{t("debts.page.allDebts")}</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1 sm:w-64">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder={t("debts.page.searchPlaceholder")} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full pe-10 bg-slate-50 text-sm dark:border-slate-700 dark:bg-slate-900 focus-visible:bg-white" 
              />
            </div>
            <Button variant="outline" size="sm" className="w-full justify-center dark:border-slate-700 sm:w-auto">
              <Filter size={16} /> <span className="hidden sm:inline">{t("customers.filter")}</span>
              <span className="sm:hidden">{t("customers.filter")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center dark:border-slate-700 sm:w-auto"
              onClick={() => exportToCsv("debts", filtered, exportHeaders as any)}
            >
              <Download size={16} /> {t("common.csv")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center dark:border-slate-700 sm:w-auto"
              onClick={() => exportToXlsx("debts", filtered, exportHeaders as any)}
            >
              <FileSpreadsheet size={16} /> {t("common.excel")}
            </Button>
          </div>
        </CardHeader>

        {error && (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 mx-6 mt-4 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="overflow-x-auto bg-white dark:bg-slate-800">
          <table className="w-full text-sm text-start whitespace-nowrap">
            <thead className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-start">{t("debts.page.colId")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.customer")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("debts.page.colDate")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("debts.page.colCategory")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.totalDebt")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.status")}</th>
                <th className="px-6 py-4 font-semibold text-center">{t("customers.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {(isLoading ? [] : filtered).map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-5 font-medium text-slate-600 dark:text-slate-400">#{item.id.slice(-6)}</td>
                  <td className="px-6 py-5">
                    <Link href={`/dashboard/customers/${item.customerId}`} className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
                      {item.customerName}
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item.category || "-"}</span>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-900 dark:text-white text-[15px]">
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={14} className="text-slate-400" />
                      {item.principalAmount.toLocaleString()} {item.currency}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(item.status)}`}>
                      {t(`analytics.charts.status.${item.status}`) || item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Link href={`/dashboard/debts/${item.id}`}>
                      <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 h-9">
                        <Eye size={16} /> {t("debts.page.viewDetails")}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {isLoading && (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-slate-100 dark:border-slate-700">
                    <td className="px-6 py-5" colSpan={7}>
                      <div className="grid grid-cols-7 gap-4">
                        <Skeleton className="h-4 col-span-1" />
                        <Skeleton className="h-4 col-span-2" />
                        <Skeleton className="h-4 col-span-1" />
                        <Skeleton className="h-4 col-span-1" />
                        <Skeleton className="h-4 col-span-1" />
                        <Skeleton className="h-4 col-span-1" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    <EmptyState
                      title={t("common.noResults")}
                      description={t("debts.page.subtitle")}
                      actionLabel={t("debts.page.newDebt")}
                      actionHref="/dashboard/debts/new"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
