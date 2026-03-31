"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Eye, Calendar, CreditCard, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";

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
  const { t, i18n } = useTranslation();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">سجل الديون العام</h1>
          <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">إدارة ومتابعة كافة المديونيات المسجلة في النظام.</p>
        </div>
        <Link href="/dashboard/debts/new">
          <Button className="gap-2">
            <Plus size={18} />
            دين جديد
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden dark:bg-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 py-5 bg-white dark:bg-slate-800">
          <CardTitle className="text-lg text-slate-900 dark:text-white">كافة المديونيات</CardTitle>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <div className="relative">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="بحث برقم الدين أو العميل..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pe-10 h-10 w-full sm:w-64 text-sm bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 focus-visible:bg-white" 
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-10 w-10 sm:w-auto px-0 sm:px-4 flex items-center justify-center dark:border-slate-700">
              <Filter size={16} /> <span className="hidden sm:inline">تصفية</span>
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
                <th className="px-6 py-4 font-semibold text-start">رقم الدين</th>
                <th className="px-6 py-4 font-semibold text-start">العميل</th>
                <th className="px-6 py-4 font-semibold text-start">التاريخ</th>
                <th className="px-6 py-4 font-semibold text-start">الفئة</th>
                <th className="px-6 py-4 font-semibold text-start">المبلغ الإجمالي</th>
                <th className="px-6 py-4 font-semibold text-start">الحالة</th>
                <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
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
                      {item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : "—"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item.category || "—"}</span>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-900 dark:text-white text-[15px]">
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={14} className="text-slate-400" />
                      {item.principalAmount.toLocaleString()} {item.currency}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Link href={`/dashboard/debts/${item.id}`}>
                      <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 h-9">
                        <Eye size={16} /> عرض التفاصيل
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    جاري تحميل سجل الديون...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    لا يوجد ديون مسجلة حالياً.
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
