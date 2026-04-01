"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Info,
  User,
  UserCheck,
  Phone,
  ShieldAlert,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { activateGuarantor, deleteDebt, getDebt, payInstallment } from "@/lib/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DebtDetailsPage() {
  const { t, i18n } = useTranslation();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const debtId = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debt, setDebt] = useState<any | null>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [isGuarantorActive, setIsGuarantorActive] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const refresh = async () => {
    if (!debtId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDebt(debtId);
      setDebt(data.debt);
      setInstallments(data.installments ?? []);
      setIsGuarantorActive(data.debt.guarantorActive ?? false);
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to load debt");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [debtId, t]);

  const stats = useMemo(() => {
    if (!debt) return { total: 0, paid: 0, remaining: 0, progress: 0 };
    const total = debt.principalAmount || 0;
    const paid = installments.filter((i) => i.status === "paid").reduce((acc, i) => acc + (i.amount || 0), 0);
    const remaining = total - paid;
    const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
    return { total, paid, remaining, progress };
  }, [debt, installments]);
  const hasGuarantorInfo = Boolean(debt?.guarantor?.name || debt?.guarantor?.phone);

  const handleActivateGuarantor = async () => {
    if (!debtId) return;
    try {
      await activateGuarantor(debtId);
      setIsGuarantorActive(true);
      setShowActivateModal(false);
      setActivationSuccess(true);
      setTimeout(() => setActivationSuccess(false), 5000);
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Activation failed");
    }
  };

  const handlePay = async (installmentId: string) => {
    try {
      await payInstallment(installmentId, { method: "cash" });
      await refresh();
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Payment failed");
    }
  };

  const handleDelete = async () => {
    if (!debtId) return;
    try {
      await deleteDebt(debtId);
      router.push("/dashboard/customers");
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Delete failed");
    }
  };

  const handleDownloadPdf = async () => {
    if (!debt) return;
    setIsDownloadingPdf(true);
    const paid = installments.filter((i) => i.status === "paid").reduce((acc, i) => acc + (i.amount || 0), 0);
    const remaining = (debt.principalAmount || 0) - paid;
    const dueDate = debt.dueDate ? new Date(debt.dueDate).toISOString().slice(0, 10) : "-";
    const title = `Debt-${debt.id?.slice(-6)?.toUpperCase?.() ?? ""}`;

    const rows = installments.map((inst: any, idx: number) => `
      <tr>
        <td style="padding:8px;border:1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${(inst.amount ?? 0).toLocaleString()} ${t("dashboard.currency")}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${inst.dueDate ? inst.dueDate.split("T")[0] : "-"}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${inst.status === "paid" ? t("analytics.charts.status.paid") : t("analytics.charts.status.active")}</td>
      </tr>
    `).join("");

    const container = document.createElement("div");
    container.dir = i18n.dir();
    container.style.position = "fixed";
    container.style.left = "-10000px";
    container.style.top = "0";
    container.style.width = "794px";
    container.style.background = "#ffffff";
    container.style.color = "#0f172a";
    container.style.padding = "24px";
    container.style.fontFamily = "Arial, sans-serif";

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:20px;font-weight:700;">${t("debts.details.downloadPdf")}</div>
          <div style="color:#64748b;font-size:12px;margin-top:4px;">${title}</div>
        </div>
        <div style="text-align:end;font-size:12px;color:#64748b;">${t("common.dueDate")}: ${dueDate}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px;">
        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;">
          <div style="font-size:12px;color:#64748b;">${t("debts.new.s2.amount")}</div>
          <div style="font-weight:700;margin-top:4px;">${(debt.principalAmount ?? 0).toLocaleString()} ${t("dashboard.currency")}</div>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;">
          <div style="font-size:12px;color:#64748b;">${t("debts.details.paidAmount")}</div>
          <div style="font-weight:700;margin-top:4px;">${paid.toLocaleString()} ${t("dashboard.currency")}</div>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;">
          <div style="font-size:12px;color:#64748b;">${t("debts.details.remainingAmount")}</div>
          <div style="font-weight:700;margin-top:4px;">${remaining.toLocaleString()} ${t("dashboard.currency")}</div>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;">
          <div style="font-size:12px;color:#64748b;">${t("debts.details.installment")}</div>
          <div style="font-weight:700;margin-top:4px;">${installments.length}</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:12px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px;border:1px solid #e2e8f0;text-align:start;">${t("debts.details.installment")}</th>
            <th style="padding:8px;border:1px solid #e2e8f0;text-align:start;">${t("debts.new.s2.amount")}</th>
            <th style="padding:8px;border:1px solid #e2e8f0;text-align:start;">${t("common.dueDate")}</th>
            <th style="padding:8px;border:1px solid #e2e8f0;text-align:start;">${t("common.status")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    document.body.appendChild(container);
    try {
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${title}.pdf`);
    } finally {
      document.body.removeChild(container);
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading && !debt) {
    return <div className="p-8 text-center">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Link href={`/dashboard/customers/${debt?.customerId}`}>
            <Button variant="outline" size="sm" className="rounded-full h-12 w-12 border-slate-200 dark:border-slate-700">
              <ArrowRight size={22} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                #{debt?.id?.slice(-6).toUpperCase()}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                debt?.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              }`}>
                {debt?.status === "paid" ? t("analytics.charts.status.paid") : t("analytics.charts.status.active")}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{debt?.category || t("debts.new.s2.types.t1")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-red-500 border-red-200 bg-white hover:bg-red-50 gap-2 dark:bg-slate-900 dark:border-red-900/30 dark:hover:bg-red-900/20"
            onClick={() => setShowDeleteConfirm(true)}
          >
             <Trash2 size={16} /> {t("common.delete")}
          </Button>
          <Button
            variant="outline"
            className="gap-2 hidden sm:flex border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
          >
            <Download size={16} /> {isDownloadingPdf ? t("common.loading") : t("debts.details.downloadPdf")}
          </Button>
          <Button className="gap-2 shadow-sm shadow-primary/20 bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white">
            <FileSpreadsheet size={16} /> {t("debts.details.issueInvoice")}
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl border-red-200 dark:bg-slate-900 p-8 text-center ring-1 ring-red-500/10">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("common.confirm")}</h2>
              <p className="text-slate-500 mb-6">{t("guarantor.modal.desc")}</p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>{t("common.cancel")}</Button>
                <Button variant="destructive" className="flex-1 shadow-lg shadow-red-500/20" onClick={handleDelete}>{t("common.delete")}</Button>
              </div>
          </Card>
        </div>
      )}

      {activationSuccess && (
        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-full">
            <Check size={18} />
          </div>
          <p className="font-semibold">{t("guarantor.modal.success")}</p>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-0 shadow-lg shadow-slate-200/40 dark:bg-slate-800 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 start-0 w-full h-1.5 bg-primary/20">
            <div className="h-full bg-primary" style={{ width: `${stats.progress}%` }} />
          </div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" className="dark:stroke-slate-700" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${stats.progress}, 100`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.progress}%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("debts.details.progress")}</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{t("debts.new.s2.amount")}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    <span className="inline-flex items-baseline gap-2">
                      <span>{stats.total.toLocaleString()}</span>
                      <span className="text-sm font-medium">{t("dashboard.currency")}</span>
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-green-500 text-xs font-bold uppercase tracking-widest mb-1">{t("debts.details.paidAmount")}</p>
                  <p className="text-2xl font-black text-green-600 dark:text-green-400">
                    <span className="inline-flex items-baseline gap-2">
                      <span>{stats.paid.toLocaleString()}</span>
                      <span className="text-sm font-medium">{t("dashboard.currency")}</span>
                    </span>
                  </p>
                </div>
                <div className="col-span-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">{t("debts.details.remainingAmount")}</p>
                  <p className="text-3xl font-black text-orange-600 dark:text-orange-400">
                    <span className="inline-flex items-baseline gap-2">
                      <span>{stats.remaining.toLocaleString()}</span>
                      <span className="text-sm font-medium">{t("dashboard.currency")}</span>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guarantor Card */}
        <Card className={`border-0 shadow-lg shadow-slate-200/40 rounded-3xl overflow-hidden transition-all ${
           isGuarantorActive ? "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30" : "bg-slate-900 text-white"
        }`}>
          <CardContent className="p-7 flex flex-col h-full">
            <div className={`p-3 rounded-2xl w-fit mb-5 ${isGuarantorActive ? "bg-red-100 text-red-600" : "bg-white/10 text-white"}`}>
              {isGuarantorActive ? <ShieldAlert size={24} /> : <UserCheck size={24} />}
            </div>
            <h3 className="text-xl font-bold mb-1">{t("guarantor.sectionTitle")}</h3>
            <p className={isGuarantorActive ? "text-red-700/70" : "text-slate-400"}>
              {isGuarantorActive ? t("guarantor.status.active") : t("guarantor.desc")}
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <User size={18} className="opacity-40" />
                <span className="font-bold">{debt?.guarantor?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="opacity-40" />
                <span className="font-bold tracking-widest" dir="ltr">{debt?.guarantor?.phone || "-"}</span>
              {!hasGuarantorInfo && <div className="text-sm opacity-70">{t("guarantor.status.noGuarantor")}</div>}
              </div>
            </div>

            <div className="mt-auto pt-8">
              {!isGuarantorActive ? (
                <Button 
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold gap-2 disabled:opacity-60"
                  onClick={() => setShowActivateModal(true)}
                  disabled={!hasGuarantorInfo}
                >
                  {t("guarantor.activateBtn")}
                </Button>
              ) : (
                <div className="bg-red-600 text-white p-3 rounded-xl text-center text-sm font-bold shadow-lg shadow-red-600/20 animate-pulse">
                  {t("guarantor.alert")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Installment Schedule */}
      <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-3xl overflow-hidden dark:bg-slate-800">
        <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-xl">
              <Calendar size={20} className="text-slate-500 dark:text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{t("debts.new.s3.installments")}</h3>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-500">{t("analytics.charts.status.paid")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-500">{t("analytics.charts.status.active")}</span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-700">
          {installments.map((inst, idx) => (
            <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg ${
                  inst.status === "paid" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-lg">
                    {inst.amount.toLocaleString()} <span className="text-sm font-medium opacity-50">{t("dashboard.currency")}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    {t("debts.details.installment")} {idx + 1}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-end">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold mb-1">
                    <Clock size={14} />
                    <span className="text-sm">{t("common.dueDate") ?? "Due Date"}</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{inst.dueDate ? inst.dueDate.split("T")[0] : "-"}</p>
                </div>
                
                {inst.status === "paid" ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2.5 rounded-xl border border-green-100 dark:border-green-900/30">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-black uppercase tracking-tight">{t("analytics.charts.status.paid")}</span>
                  </div>
                ) : (
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white font-black px-6 rounded-xl shadow-lg shadow-primary/20 h-11"
                    onClick={() => handlePay(inst.id)}
                  >
                    {t("debts.details.markAsPaid")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6 rounded-3xl flex items-start gap-4">
        <Info className="text-blue-500 shrink-0 mt-1" size={20} />
        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
          {t("debts.new.s4.desc")}
        </p>
      </div>

      {/* Activation Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl border-0 overflow-hidden dark:bg-slate-900 rounded-3xl">
            <div className="bg-slate-900 p-8 text-center text-white relative">
              <button onClick={() => setShowActivateModal(false)} className="absolute top-4 end-4 text-white/40 hover:text-white">
                <ArrowRight className="rotate-180" size={24} />
              </button>
              <div className="bg-white/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-white">
                <ShieldAlert size={40} />
              </div>
              <h2 className="text-2xl font-black mb-3">{t("guarantor.modal.title")}</h2>
              <p className="text-white/60 text-sm leading-relaxed">{t("guarantor.modal.desc")}</p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 flex flex-col gap-3">
              <Button onClick={handleActivateGuarantor} className="w-full h-14 text-lg font-black bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl">
                 {t("guarantor.modal.confirm")}
              </Button>
              <Button variant="ghost" onClick={() => setShowActivateModal(false)} className="w-full h-12 font-bold text-slate-500">
                 {t("guarantor.modal.cancel")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
