"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, MoreVertical, Phone, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";
import { exportToCsv, exportToXlsx } from "@/lib/utils/export";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

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
  const [pageSize, setPageSize] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);
  const initialSearchFetchRef = useRef(true);

  const fetchItems = async (page: number, q: string, reqId: number, limit = pageSize) => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = q.trim() ? `&search=${encodeURIComponent(q.trim())}` : "";
      const res = await apiFetch<{
        items: Customer[];
        page: number;
        totalPages: number;
        total: number;
        limit?: number;
      }>(`/customers?page=${page}&limit=${limit}${qs}`);
      if (reqId !== latestRequestIdRef.current) return;
      setItems(res.items ?? []);
      const total = res.total ?? 0;
      const rawPages = res.totalPages ?? 0;
      const totalPages = total === 0 ? 1 : Math.max(1, rawPages);
      setPagination({
        page: res.page ?? page,
        totalPages,
        total,
      });
    } catch (err: any) {
      if (reqId !== latestRequestIdRef.current) return;
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to load customers");
    } finally {
      if (reqId === latestRequestIdRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialSearchFetchRef.current) {
      initialSearchFetchRef.current = false;
      return;
    }
    const reqId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = reqId;
    const timeout = setTimeout(() => {
      fetchItems(1, search, reqId, pageSize);
    }, 450);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const reqId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = reqId;
    fetchItems(1, search, reqId, pageSize);
  }, [pageSize]);

  const fromCount =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pageSize + 1;
  const toCount =
    pagination.total === 0
      ? 0
      : Math.min(pagination.page * pageSize, pagination.total);

  const onPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const reqId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = reqId;
    fetchItems(newPage, search, reqId, pageSize);
  };

  const onPageSizeChange = (value: string) => {
    const nextSize = Number(value);
    if (!Number.isFinite(nextSize) || nextSize <= 0) return;
    if (nextSize === pageSize) return;
    setPageSize(nextSize);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("customers.title")}</h1>
          <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">{t("customers.subtitle")}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            variant="outline" 
            className="w-full border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-auto"
            onClick={() => exportToCsv("customers", items, {
              name: t("customers.table.customer"),
              phone: t("customers.table.phone"),
              type: t("customers.table.type"),
              totalDebt: t("customers.table.totalDebt"),
              status: t("customers.table.status"),
            } as any)}
          >
            <Download size={18} />
            {t("common.csv")}
          </Button>
          <Button
            variant="outline"
            className="w-full border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-auto"
            onClick={() => exportToXlsx("customers", items, {
              name: t("customers.table.customer"),
              phone: t("customers.table.phone"),
              type: t("customers.table.type"),
              totalDebt: t("customers.table.totalDebt"),
              status: t("customers.table.status"),
            } as any)}
          >
            <FileSpreadsheet size={18} />
            {t("common.excel")}
          </Button>
          <Link href="/dashboard/customers/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus size={18} />
              {t("customers.addCustomer")}
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder={t("customers.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pe-10 dark:bg-slate-900 dark:border-slate-700 text-start"
            />
          </div>
          <Button variant="outline" className="w-full dark:border-slate-700 dark:hover:bg-slate-700 sm:w-auto">{t("customers.filter")}</Button>
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
                    <div className="relative inline-block text-start">
                      <details className="group">
                        <summary className="list-none cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                          <MoreVertical size={18} />
                        </summary>
                        <div className="absolute end-0 mt-2 w-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-10 overflow-hidden">
                          <Link
                            href={`/dashboard/customers/${c.id}`}
                            className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                            onClick={(e) => {
                              const details = (e.currentTarget.closest("details") as HTMLDetailsElement | null);
                              details?.removeAttribute("open");
                            }}
                          >
                            {t("guarantor.page.list.view")}
                          </Link>
                          <button
                            type="button"
                            className="w-full text-start px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                            onClick={(e) => {
                              navigator.clipboard?.writeText(c.phone ?? "");
                              const details = (e.currentTarget.closest("details") as HTMLDetailsElement | null);
                              details?.removeAttribute("open");
                            }}
                          >
                            {t("customers.table.phone")}
                          </button>
                        </div>
                      </details>
                    </div>
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
        <div className="mt-6 flex flex-col gap-3 px-2 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {isLoading && items.length === 0
              ? t("common.loading")
              : pagination.total === 0
                ? t("customers.paginationEmpty")
                : t("customers.pagination", { from: fromCount, to: toCount, count: pagination.total })}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">{t("customers.rowsPerPage")}</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
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
