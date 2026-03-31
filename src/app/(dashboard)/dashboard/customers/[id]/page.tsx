"use client";

import Link from "next/link";
import { ArrowRight, Phone, Mail, MapPin, Search, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCustomer, getCustomerDebts } from "@/lib/api";

type Debt = {
  id: string;
  principalAmount: number;
  currency: string;
  planType: "one_time" | "installments";
  dueDate: string | null;
  category: string | null;
  status: string;
  createdAt?: string;
};

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [c, d] = await Promise.all([getCustomer(params.id), getCustomerDebts(params.id)]);
        if (cancelled) return;
        setCustomer(c);
        setDebts((d.items ?? []) as Debt[]);
      } catch (err: any) {
        const key = err?.messageKey as string | undefined;
        if (!cancelled) setError(key ? t(key) : err?.message ?? "Failed to load customer");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, t]);

  const totals = useMemo(() => {
    const totalDebt = debts.reduce((sum, d) => sum + (d.principalAmount ?? 0), 0);
    return { totalDebt };
  }, [debts]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers">
            <Button variant="ghost" className="px-2 hidden sm:flex">
              <ArrowRight size={20} className="text-slate-500 hover:text-slate-900" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {isLoading ? "..." : (customer?.name ?? "-")}
            </h1>
            <p className="text-slate-500 mt-1 text-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
               <span className="flex items-center gap-1"><Phone size={14} /> <span dir="ltr">{customer?.phone ?? "-"}</span></span>
               <span className="flex items-center gap-1"><Mail size={14} /> {customer?.email ?? "-"}</span>
               <span className="flex items-center gap-1"><MapPin size={14} /> {customer?.address ?? "-"}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="text-slate-600 hidden md:flex">تعديل البيانات</Button>
          <Link href="/dashboard/debts/new">
            <Button className="whitespace-nowrap">إضافة دين جديد +</Button>
          </Link>
        </div>
      </div>

      {/* Customer Financial Overview */}
      <div className="grid gap-6 md:grid-cols-3 pt-2">
        <Card className="bg-primary/5 border-primary/10 shadow-sm shadow-primary/5 rounded-2xl">
          <CardContent className="p-6">
             <p className="text-sm font-medium text-primary">إجمالي المديونية</p>
             <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {totals.totalDebt.toLocaleString()} <span className="text-sm text-slate-500 font-medium">ر.س</span>
             </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100 shadow-sm shadow-green-500/5 rounded-2xl">
          <CardContent className="p-6">
             <p className="text-sm font-medium text-green-700">المبلغ المُسدّد</p>
             <p className="text-3xl font-extrabold text-green-700 mt-2">— <span className="text-sm opacity-70">ر.س</span></p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100 shadow-sm shadow-orange-500/5 rounded-2xl">
          <CardContent className="p-6">
             <p className="text-sm font-medium text-orange-700">المبلغ المتبقي</p>
             <p className="text-3xl font-extrabold text-orange-700 mt-2">— <span className="text-sm opacity-70">ر.س</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden mt-6">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 py-5 bg-white">
          <CardTitle className="text-lg text-slate-900">سجل المديونيات (كشف الحساب)</CardTitle>
          <div className="flex gap-2 mt-4 sm:mt-0">
             <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input placeholder="بحث برقم المديونية..." className="pr-10 h-10 w-full sm:w-64 text-sm bg-slate-50 border-transparent focus-visible:bg-white" />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-10 w-10 sm:w-auto px-0 sm:px-4 shrink-0 flex items-center justify-center">
              <Filter size={16} /> <span className="hidden sm:inline">تصفية</span>
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-sm text-right whitespace-nowrap">
            <thead className="text-sm text-slate-500 bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">رقم السجل</th>
                <th className="px-6 py-4 font-semibold">التاريخ</th>
                <th className="px-6 py-4 font-semibold">التفاصيل</th>
                <th className="px-6 py-4 font-semibold leading-normal">القيمة</th>
                <th className="px-6 py-4 font-semibold">الحالة</th>
                <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-medium text-slate-600">#{tx.id}</td>
                  <td className="px-6 py-5 text-slate-500 font-medium">{tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0,10) : "-"}</td>
                  <td className="px-6 py-5 font-bold text-slate-900">{tx.category ?? "-"}</td>
                  <td className="px-6 py-5 font-black text-slate-900 text-[15px]">
                    {(tx.principalAmount ?? 0).toLocaleString()} ر.س
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block ${
                      tx.status === "paid" ? "bg-green-100 text-green-700 border border-green-200" :
                      tx.status === "late" ? "bg-red-100 text-red-700 border border-red-200" :
                      "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Link href={`/dashboard/debts/${tx.id}`}>
                      <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 h-9">
                        <Eye size={16} /> عرض وتعديل
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && debts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    لا توجد ديون لهذا العميل حالياً
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
