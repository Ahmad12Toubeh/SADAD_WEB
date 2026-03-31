"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Phone, Mail, MapPin, Eye, Edit2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCustomer, getCustomerDebts, updateCustomer, deleteCustomer } from "@/lib/api";

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
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [c, d] = await Promise.all([getCustomer(params.id), getCustomerDebts(params.id)]);
      setCustomer(c);
      setDebts((d.items ?? []) as Debt[]);
      setEditForm({
        name: c.name ?? "",
        phone: c.phone ?? "",
        email: c.email ?? "",
        address: c.address ?? "",
      });
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to load customer");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id, t]);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await updateCustomer(params.id, editForm);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer(params.id);
      router.push("/dashboard/customers");
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers">
            <Button variant="ghost" className="px-2">
              <ArrowRight size={24} className="text-slate-500 hover:text-slate-900 dark:hover:text-white" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isLoading ? "..." : (customer?.name ?? "-")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
               <span className="flex items-center gap-1"><Phone size={14} /> <span dir="ltr">{customer?.phone ?? "-"}</span></span>
               {customer?.email && <span className="flex items-center gap-1"><Mail size={14} /> {customer.email}</span>}
               {customer?.address && <span className="flex items-center gap-1"><MapPin size={14} /> {customer.address}</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 dark:border-slate-700" onClick={() => setIsEditModalOpen(true)}>
            <Edit2 size={16} /> {t("customers.details.editBtn")}
          </Button>
          <Button variant="destructive" className="gap-2" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={16} /> {t("common.delete")}
          </Button>
          <Link href="/dashboard/debts/new">
            <Button className="whitespace-nowrap">{t("sidebar.addDebt")} +</Button>
          </Link>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/10 rounded-2xl shadow-sm">
          <CardContent className="p-6">
             <p className="text-sm font-medium text-primary">{t("customers.details.totalDebt")}</p>
             <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              {(customer?.summary?.totalDebt ?? 0).toLocaleString()} <span className="text-sm text-slate-500 font-medium">{t("dashboard.currency")}</span>
             </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-500/5 border-green-100 dark:border-green-500/20 rounded-2xl shadow-sm">
          <CardContent className="p-6">
             <p className="text-sm font-medium text-green-700 dark:text-green-400">{t("customers.details.paidAmount")}</p>
             <p className="text-3xl font-black text-green-700 dark:text-green-400 mt-2">
              {(customer?.summary?.paidAmount ?? 0).toLocaleString()} <span className="text-sm opacity-70">{t("dashboard.currency")}</span>
             </p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/20 rounded-2xl shadow-sm">
          <CardContent className="p-6">
             <p className="text-sm font-medium text-orange-700 dark:text-orange-400">{t("customers.details.remainingAmount")}</p>
             <p className="text-3xl font-black text-orange-700 dark:text-orange-400 mt-2">
              {(customer?.summary?.remainingAmount ?? 0).toLocaleString()} <span className="text-sm opacity-70">{t("dashboard.currency")}</span>
             </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden mt-6 dark:bg-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 py-5 bg-white dark:bg-slate-800">
          <CardTitle className="text-lg text-slate-900 dark:text-white">{t("customers.details.transactionsTitle")}</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start whitespace-nowrap">
            <thead className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.actions")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("debts.new.s4.date") ?? "Date"}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.type")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.totalDebt")}</th>
                <th className="px-6 py-4 font-semibold text-start">{t("customers.table.status")}</th>
                <th className="px-6 py-4 font-semibold text-center">{t("customers.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-5 font-medium text-slate-500">#{tx.id.slice(-6)}</td>
                  <td className="px-6 py-5 text-slate-600 dark:text-slate-400 font-medium">
                    {tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0, 10) : "-"}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-900 dark:text-white">{tx.category ?? "—"}</td>
                  <td className="px-6 py-5 font-black text-slate-900 dark:text-white">
                    {tx.principalAmount.toLocaleString()} {t("dashboard.currency")}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      tx.status === "paid" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" :
                      tx.status === "late" ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {tx.status === "paid" ? t("analytics.charts.status.paid") : tx.status === "late" ? t("analytics.charts.status.late") : t("analytics.charts.status.active")}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Link href={`/dashboard/debts/${tx.id}`}>
                      <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 h-9">
                        <Eye size={16} /> {t("guarantors.page.list.view")}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && debts.length === 0 && (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">{t("customers.details.emptyDebts")}</div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl overflow-hidden dark:bg-slate-900">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("customers.details.editBtn")}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>{t("customers.new.fullName")}</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm(p => ({...p, name: e.target.value}))} className="text-start" />
              </div>
              <div className="space-y-2">
                <Label>{t("customers.new.phone")}</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm(p => ({...p, phone: e.target.value}))} dir="ltr" className="text-start" />
              </div>
              <div className="space-y-2">
                <Label>{t("customers.new.email")}</Label>
                <Input value={editForm.email} onChange={(e) => setEditForm(p => ({...p, email: e.target.value}))} dir="ltr" className="text-start" />
              </div>
              <div className="space-y-2">
                <Label>{t("customers.new.address")}</Label>
                <Input value={editForm.address} onChange={(e) => setEditForm(p => ({...p, address: e.target.value}))} className="text-start" />
              </div>
            </CardContent>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3 border-t dark:border-slate-800">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleUpdate} disabled={isSaving} className="gap-2">
                {isSaving ? t("common.loading") : t("common.save")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl border-red-200 dark:bg-slate-900">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("common.confirm")}</h2>
              <p className="text-slate-500 mb-6">{t("guarantor.modal.desc")}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>{t("common.cancel")}</Button>
                <Button variant="destructive" className="flex-1" onClick={handleDelete}>{t("common.delete")}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
