"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, MoreVertical, Phone, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";
import { exportToCsv } from "@/lib/utils/export";

type Customer = {
  id: string;
  type: "individual" | "company";
  name: string;
  phone: string;
  status: "regular" | "late" | "defaulting";
  totalDebt?: number;
};

export default function CustomersPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const fetchItems = async (page: number, q: string, reqId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = q.trim() ? `&search=${encodeURIComponent(q.trim())}` : "";
      const res = await apiFetch<{ items: Customer[]; page: number; totalPages: number; total: number }>(
        `/customers?page=${page}&limit=20${qs}`
      );
      if (reqId !== latestRequestIdRef.current) return;
      setItems(res.items);
      setPagination({ page: res.page, totalPages: res.totalPages, total: res.total });
    } catch (err: any) {
      if (reqId !== latestRequestIdRef.current) return;
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to load customers");
    } finally {
      if (reqId === latestRequestIdRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    const reqId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = reqId;
    const timeout = setTimeout(() => {
      fetchItems(1, search, reqId);
    }, 450);
    return () => clearTimeout(timeout);
  }, [search]);

  const onPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const reqId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = reqId;
    fetchItems(newPage, search, reqId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("customers.title")}</h1>
          <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">{t("customers.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            onClick={() => exportToCsv("customers", items, {
              name: t("customers.table.customer"),
              phone: t("customers.table.phone"),
              type: t("customers.table.type"),
              totalDebt: t("customers.table.totalDebt"),
              status: t("customers.table.status"),
            } as any)}
          >
            <Download size={18} />
            {t("common.export")}
          </Button>
          <Link href="/dashboard/customers/new">
            <Button className="gap-2">
              <Plus size={18} />
              {t("customers.addCustomer")}
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder={t("customers.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pe-10 dark:bg-slate-900 dark:border-slate-700 text-start"
            />
          </div>
          <Button variant="outline" className="dark:border-slate-700 dark:hover:bg-slate-700">{t("customers.filter")}</Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.customer")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.type")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.phone")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.totalDebt")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.status")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {(isLoading ? [] : items).map((c) => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    <Link href={`/dashboard/customers/${c.id}`} className="hover:text-primary transition-colors">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-xs">
                      {c.type === "company" ? t("customers.new.typeCompany") : t("customers.new.typeIndividual")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span dir="ltr">{c.phone}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                    {(c.totalDebt ?? 0).toLocaleString()} {t("dashboard.currency")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.status === "regular" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      c.status === "late" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {c.status === "regular" ? t("customers.status.regular") :
                       c.status === "late" ? t("customers.status.late") :
                       t("customers.status.defaulting")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {isLoading && (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-slate-100 dark:border-slate-700">
                    <td className="px-6 py-4" colSpan={6}>
                      <div className="grid grid-cols-6 gap-4">
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
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    <EmptyState
                      title={t("common.noResults")}
                      description={t("customers.subtitle")}
                      actionLabel={t("customers.addCustomer")}
                      actionHref="/dashboard/customers/new"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 text-sm text-slate-500 dark:text-slate-400 px-2">
          <span>{t("customers.pagination")} - {pagination.total} {t("customers.title")}</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={pagination.page <= 1 || isLoading} 
              onClick={() => onPageChange(pagination.page - 1)}
              className="dark:border-slate-700 dark:bg-slate-800"
            >
              {t("customers.prev")}
            </Button>
            <span className="flex items-center px-2">{pagination.page} / {pagination.totalPages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => onPageChange(pagination.page + 1)}
              className="dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {t("customers.next")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
