"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, MoreVertical, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";

type Customer = {
  id: string;
  type: "individual" | "company";
  name: string;
  phone: string;
  status: "regular" | "late" | "defaulting";
};

export default function CustomersPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiFetch<{ items: Customer[] }>("/customers?page=1&limit=50");
        if (!cancelled) setItems(res.items);
      } catch (err: any) {
        const key = err?.messageKey as string | undefined;
        if (!cancelled) setError(key ? t(key) : err?.message ?? "Failed to load customers");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return items;
    return items.filter((c) => c.name.includes(q) || c.phone.includes(q));
  }, [items, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("customers.title")}</h1>
          <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">{t("customers.subtitle")}</p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="gap-2">
            <Plus size={18} />
            {t("customers.addCustomer")}
          </Button>
        </Link>
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
              className="pe-10 dark:bg-slate-900 dark:border-slate-700"
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
              {(isLoading ? [] : filtered).map((c) => (
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
                    — {t("dashboard.currency")}
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
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    {t("auth.login.loading")}
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    {t("customers.searchPlaceholder")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="flex items-center justify-between mt-6 text-sm text-slate-500 dark:text-slate-400 px-2">
          <span>{t("customers.pagination")}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="dark:border-slate-700 dark:bg-slate-800">{t("customers.prev")}</Button>
            <Button variant="outline" size="sm" className="dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">{t("customers.next")}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
