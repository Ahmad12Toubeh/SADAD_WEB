"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Search, UserCheck, Phone, ShieldCheck, ShieldAlert, FileText, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { listGuarantors } from "@/lib/api";

export default function GuarantorsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await listGuarantors();
        if (!cancelled) setItems(res.items ?? []);
      } catch (err: any) {
        const key = err?.messageKey as string | undefined;
        if (!cancelled) setError(key ? t(key) : err?.message ?? "Failed to load guarantors");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const filteredGuarantors = useMemo(() => {
    const q = searchTerm.trim();
    if (!q) return items;
    return items.filter((g) => (g?.name ?? "").includes(q) || (g?.phone ?? "").includes(q));
  }, [items, searchTerm]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter(i => i.status === 'active').length;
    const bouncing = items.filter(i => i.debtStatus === 'late' || i.debtStatus === 'bad').length;
    const safe = total - bouncing;
    return { total, active, bouncing, safe };
  }, [items]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <UserCheck size={28} className="text-primary" />
            {t("guarantor.page.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{t("guarantor.page.subtitle")}</p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input 
            placeholder={t("guarantor.page.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10 h-11 dark:bg-slate-900 border-slate-200 dark:border-slate-800" 
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mt-8">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("guarantor.page.stats.total")}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {isLoading ? "…" : stats.total}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("guarantor.page.stats.safe")}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                   {isLoading ? "…" : stats.safe}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl">
                <ShieldAlert size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("guarantor.page.stats.bouncing")}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {isLoading ? "…" : stats.bouncing}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("guarantor.page.stats.contracts")}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {isLoading ? "…" : stats.total}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-6 py-4 text-start">{t("guarantor.page.columns.name")}</th>
                <th className="px-6 py-4 text-start">{t("guarantor.page.columns.phone")}</th>
                <th className="px-6 py-4 text-start">{t("guarantor.page.columns.totalCapital")}</th>
                <th className="px-6 py-4 text-start">{t("guarantor.page.columns.risk")}</th>
                <th className="px-6 py-4 text-end">{t("guarantor.page.columns.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGuarantors.map((guarantor: any) => (
                <tr key={guarantor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                        {guarantor.name?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{guarantor.name ?? "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2" dir="ltr">
                      <Phone size={14} className="text-slate-400" />
                      {guarantor.phone ?? "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(guarantor.totalDebt ?? 0).toLocaleString()} <span className="text-xs text-slate-400">{t("dashboard.currency")}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                      guarantor.debtStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      guarantor.debtStatus === 'late' || guarantor.debtStatus === 'bad' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {guarantor.debtStatus === 'paid' ? t("guarantor.page.riskLevels.safe") : 
                       guarantor.debtStatus === 'late' || guarantor.debtStatus === 'bad' ? t("guarantor.page.riskLevels.warning") : t("analytics.charts.status.active")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <Link href={`/dashboard/debts/${guarantor.debtId}`}>
                       <Button variant="ghost" className="h-9 px-3 text-primary dark:text-blue-400 hover:bg-primary/10 dark:hover:bg-primary/20">
                        {t("guarantor.page.list.view")}
                        <ArrowUpRight size={16} className="ml-1 rtl:mr-1 rtl:ml-0" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && filteredGuarantors.length === 0 && (
             <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
               {t("guarantor.page.list.empty")}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
