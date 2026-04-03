"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Plus, Trash2, ChevronUp, ChevronDown, Users, Calendar, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "react-i18next";
import { Association, addAssociationFundTransaction, approveAssociationFundTransaction, closeAssociationMonth, deleteAssociation, getAssociation, patchAssociation, reopenAssociationCycle } from "@/lib/api";
import { exportToCsv } from "@/lib/utils/export";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Member = { id?: string; name?: string; phone?: string; turnOrder?: number; isPaid?: boolean; isReceiver?: boolean };

export default function AssociationDetailsPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const associationId = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assoc, setAssoc] = useState<Association | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isClosingMonth, setIsClosingMonth] = useState(false);
  const [isUpdatingPayments, setIsUpdatingPayments] = useState(false);
  const [fundForm, setFundForm] = useState({ type: "in", amount: "", note: "" });
  const [approvalMemberId, setApprovalMemberId] = useState<string>("");

  const [form, setForm] = useState({
    name: "",
    members: "",
    monthlyAmount: "",
    associationKind: "rotating",
  });
  const [members, setMembers] = useState<Member[]>([]);

  const load = async () => {
    if (!associationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAssociation(associationId);
      setAssoc(data);
      setForm({
        name: data.name ?? "",
        members: String(data.members ?? 0),
        monthlyAmount: String(data.monthlyAmount ?? 0),
        associationKind: data.associationKind ?? "rotating",
      });
      const list = (data.membersList ?? []).map((m) => ({
        id: m.id,
        name: m.name ?? "",
        phone: m.phone ?? "",
        turnOrder: m.turnOrder ?? undefined,
        isPaid: Boolean(m.isPaid),
        isReceiver: Boolean(m.isReceiver),
      }));
      const fallback =
        list.length > 0
          ? list
          : Array.from({ length: Number(data.members ?? 0) || 0 }).map((_, idx) => ({ name: "", phone: "", turnOrder: idx + 1, isPaid: false, isReceiver: false }));
      setMembers(fallback);
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to load association");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [associationId, t]);

  const progressPercent = useMemo(() => {
    if (!assoc) return 0;
    const paidCount = (assoc.membersList ?? []).filter((m) => m.isPaid).length;
    return assoc.members > 0 ? Math.round((paidCount / assoc.members) * 100) : 0;
  }, [assoc]);

  const completedMembers = useMemo(() => members.filter((member) => member.name?.trim()).length, [members]);
  const hasReceiverSelected = useMemo(
    () => form.associationKind === "family" || members.some((member) => member.isReceiver),
    [form.associationKind, members],
  );
  const hasPaidMembers = useMemo(() => members.some((member) => member.isPaid), [members]);

  const onSave = async () => {
    if (!associationId) return;
    setIsSaving(true);
    setError(null);
    try {
      const monthlyNum = Number(form.monthlyAmount);
      const normalizedMembers = members
        .map((member, index) => ({
          id: member.id,
          name: member.name?.trim() || undefined,
          phone: member.phone?.trim() || undefined,
          turnOrder: member.turnOrder ?? index + 1,
          isPaid: Boolean(member.isPaid),
          isReceiver: form.associationKind === "family" ? false : Boolean(member.isReceiver),
        }))
        .filter((member) => member.name);

      if (!form.name.trim() || !Number.isFinite(monthlyNum) || monthlyNum < 1) {
        setError(t("errors.validation.invalid"));
        setIsSaving(false);
        return;
      }
      if (normalizedMembers.length < 2) {
        setError("لازم يكون في عضوين على الأقل بأسماء واضحة.");
        setIsSaving(false);
        return;
      }
      if (form.associationKind !== "family" && !normalizedMembers.some((member) => member.isReceiver)) {
        setError("حدد مستلمًا حاليًا واحدًا قبل الحفظ.");
        setIsSaving(false);
        return;
      }
      await patchAssociation(associationId, {
        name: form.name.trim(),
        monthlyAmount: monthlyNum,
        associationKind: form.associationKind as any,
        fundGuarantorMemberId: assoc?.fundGuarantorMemberId ?? undefined,
        membersList: normalizedMembers,
      });
      await load();
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to update association");
    } finally {
      setIsSaving(false);
    }
  };

  const onCloseMonth = async () => {
    if (!associationId) return;
    if (completedMembers < 2) {
      setError("لا يمكن إغلاق الشهر قبل إضافة عضوين على الأقل.");
      return;
    }
    if (!hasPaidMembers) {
      setError("لا يمكن إغلاق الشهر بدون أي دفعات مسجلة.");
      return;
    }
    if (form.associationKind !== "family" && !hasReceiverSelected) {
      setError("حدد المستلم الحالي قبل إغلاق الشهر.");
      return;
    }
    setIsClosingMonth(true);
    setError(null);
    try {
      await closeAssociationMonth(associationId);
      await load();
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to close month");
    } finally {
      setIsClosingMonth(false);
    }
  };

  const onReopenCycle = async () => {
    if (!associationId) return;
    try {
      await reopenAssociationCycle(associationId);
      await load();
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to reopen cycle");
    }
  };

  const onAddFundTransaction = async () => {
    if (!associationId) return;
    const amount = Number(fundForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t("errors.validation.invalid"));
      return;
    }
    try {
      await addAssociationFundTransaction(associationId, {
        type: fundForm.type as "in" | "out",
        amount,
        note: fundForm.note || undefined,
      });
      setFundForm({ type: "in", amount: "", note: "" });
      await load();
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to add transaction");
    }
  };

  const onApproveTransaction = async (transactionId: string) => {
    if (!associationId || !approvalMemberId) return;
    try {
      await approveAssociationFundTransaction(associationId, { transactionId, memberId: approvalMemberId });
      await load();
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to approve transaction");
    }
  };

  const onDownloadReport = async () => {
    if (!assoc) return;
    const title = `${assoc.name ?? "Association"}`;
    const history = assoc.cycleHistory ?? [];
    const container = document.createElement("div");
    container.dir = "rtl";
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
          <div style="font-size:20px;font-weight:700;">${t("associations.page.downloadReport")}</div>
          <div style="color:#64748b;font-size:12px;margin-top:4px;">${title}</div>
        </div>
      </div>
      <div style="margin-top:16px;font-size:12px;color:#64748b;">
        ${t("associations.form.kind")}: ${assoc.associationKind === "family" ? t("associations.form.kindFamily") : t("associations.form.kindRotating")}
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:12px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px;border:1px solid #e2e8f0;text-align:start;">${t("associations.page.historyMonth")}</th>
            <th style="padding:8px;border:1px solid #e2e8f0;text-align:start;">${t("associations.page.historyReceiver")}</th>
            <th style="padding:8px;border:1px solid #e2e8f0;text-align:start;">${t("associations.page.historyPaidCount")}</th>
            <th style="padding:8px;border:1px solid #e2e8f0;text-align:start;">${t("associations.page.historyTotalCollected")}</th>
          </tr>
        </thead>
        <tbody>
          ${history.map((h) => `
            <tr>
              <td style="padding:8px;border:1px solid #e2e8f0;">${h.month ?? "-"}</td>
              <td style="padding:8px;border:1px solid #e2e8f0;">${h.receiverName ?? "-"}</td>
              <td style="padding:8px;border:1px solid #e2e8f0;">${h.paidCount ?? 0}</td>
              <td style="padding:8px;border:1px solid #e2e8f0;">${h.totalCollected ?? 0} ${t("dashboard.currency")}</td>
            </tr>
          `).join("")}
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
    }
  };

  const onDelete = async () => {
    if (!associationId) return;
    try {
      await deleteAssociation(associationId);
      router.push("/dashboard/associations");
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Delete failed");
    }
  };

  const moveMember = (idx: number, dir: -1 | 1) => {
    setMembers((list) => {
      const next = [...list];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return next;
      const tmp = next[idx];
      next[idx] = next[target];
      next[target] = tmp;
      return next;
    });
  };

  const saveMembersQuick = async (nextMembers: Member[]) => {
    if (!associationId) return;
    setIsUpdatingPayments(true);
    setError(null);
    try {
      const updated = await patchAssociation(associationId, {
        associationKind: form.associationKind as any,
        membersList: nextMembers.map((m, idx) => ({
          id: m.id,
          name: m.name?.trim() || undefined,
          phone: m.phone?.trim() || undefined,
          turnOrder: m.turnOrder ?? idx + 1,
          isPaid: Boolean(m.isPaid),
          isReceiver: form.associationKind === "family" ? false : Boolean(m.isReceiver),
        })),
      });
      setAssoc(updated);
      setMembers(
        (updated.membersList ?? []).map((m) => ({
          id: m.id,
          name: m.name ?? "",
          phone: m.phone ?? "",
          turnOrder: m.turnOrder ?? undefined,
          isPaid: Boolean(m.isPaid),
          isReceiver: Boolean(m.isReceiver),
        }))
      );
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to update payment state");
    } finally {
      setIsUpdatingPayments(false);
    }
  };

  const autoSortMembers = () => {
    setMembers((list) =>
      [...list].sort((a, b) => {
        const an = (a.name ?? "").toLowerCase();
        const bn = (b.name ?? "").toLowerCase();
        if (an && bn && an !== bn) return an.localeCompare(bn, "ar");
        return (a.phone ?? "").localeCompare(b.phone ?? "");
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/associations">
            <Button variant="ghost" className="px-2">
              <ArrowRight size={22} className="text-slate-500 hover:text-slate-900 dark:hover:text-white" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {assoc?.name ?? (isLoading ? "..." : "-")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t("associations.page.subtitle")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
          <Button
            variant="outline"
            className="w-full text-red-500 border-red-200 bg-white hover:bg-red-50 dark:bg-slate-900 dark:border-red-900/30 dark:hover:bg-red-900/20 sm:w-auto"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 size={16} /> {t("common.delete")}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={onCloseMonth} disabled={isClosingMonth}>
            {isClosingMonth ? t("common.loading") : t("associations.page.closeMonth")}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={onReopenCycle} disabled={!assoc?.lockOrder}>
            {t("associations.page.reopenCycle")}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={onDownloadReport}>
            <Download size={16} /> {t("associations.page.downloadReport")}
          </Button>
          <Button className="w-full sm:w-auto" onClick={onSave} disabled={isSaving}>
            {isSaving ? t("associations.page.updating") : t("associations.page.saveChanges")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary"><Users size={20} /></div>
            <div>
              <div className="text-xs text-slate-500">{t("associations.form.members")}</div>
              <div className="font-bold text-slate-900 dark:text-white">{assoc?.members ?? 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500"><Calendar size={20} /></div>
            <div>
              <div className="text-xs text-slate-500">{t("associations.page.progress")}</div>
              <div className="font-bold text-slate-900 dark:text-white">{assoc?.currentMonth ?? 0} / {assoc?.members ?? 0} • {progressPercent}%</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><DollarSign size={20} /></div>
            <div>
              <div className="text-xs text-slate-500">{t("associations.form.amount")}</div>
              <div className="font-bold text-slate-900 dark:text-white">{assoc?.monthlyAmount?.toLocaleString?.() ?? 0} {t("dashboard.currency")}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg shadow-slate-200/40 dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">{t("associations.page.editTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t("associations.form.name")} className="dark:bg-slate-900" />
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {t("associations.form.members")}: {completedMembers}
          </div>
          <Input
            type="number"
            min={1}
            step="0.01"
            inputMode="decimal"
            value={form.monthlyAmount}
            onChange={(e) => setForm((f) => ({ ...f, monthlyAmount: e.target.value }))}
            placeholder={t("associations.form.amount")}
            className="dark:bg-slate-900"
          />
          <select
            value={form.associationKind}
            onChange={(e) => {
              const nextKind = e.target.value as "rotating" | "family";
              setForm((f) => ({ ...f, associationKind: nextKind }));
              setMembers((current) => {
                const selectedId = current.find((member) => member.isReceiver)?.id ?? current[0]?.id;
                return current.map((member) => ({
                  ...member,
                  isReceiver: nextKind === "family" ? false : member.id === selectedId,
                }));
              });
            }}
            className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm"
          >
            <option value="rotating">{t("associations.form.kindRotating")}</option>
            <option value="family">{t("associations.form.kindFamily")}</option>
          </select>
        </CardContent>
      </Card>

      {form.associationKind === "family" && (
        <Card className="border-0 shadow-lg shadow-slate-200/40 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">{t("associations.page.fundTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {t("associations.page.fundBalance")}: {(assoc?.fundBalance ?? 0).toLocaleString()} {t("dashboard.currency")}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={fundForm.type}
                onChange={(e) => setFundForm((f) => ({ ...f, type: e.target.value }))}
                className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm"
              >
                <option value="in">{t("associations.page.fundIn")}</option>
                <option value="out">{t("associations.page.fundOut")}</option>
              </select>
              <Input
                type="number"
                min={1}
                step="0.01"
                inputMode="decimal"
                value={fundForm.amount}
                onChange={(e) => setFundForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder={t("associations.page.fundAmount")}
                className="dark:bg-slate-900"
              />
              <Input
                value={fundForm.note}
                onChange={(e) => setFundForm((f) => ({ ...f, note: e.target.value }))}
                placeholder={t("associations.page.fundNote")}
                className="dark:bg-slate-900"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto" onClick={onAddFundTransaction}>{t("associations.page.addTransaction")}</Button>

            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={assoc?.fundGuarantorMemberId ?? ""}
                onChange={(e) => setAssoc((a) => (a ? { ...a, fundGuarantorMemberId: e.target.value || null } : a))}
                className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm"
              >
                <option value="">{t("associations.page.fundGuarantor")}</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name || "-"}</option>
                ))}
              </select>
              <select
                value={approvalMemberId}
                onChange={(e) => setApprovalMemberId(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm"
              >
                <option value="">{t("associations.page.selectApprover")}</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name || "-"}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {(assoc?.fundTransactions ?? []).map((tx, idx) => (
                <div key={tx.id ?? idx} className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 text-sm dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-500">{tx.type === "in" ? t("associations.page.fundIn") : t("associations.page.fundOut")}</span>
                  <span className="font-semibold">{tx.amount} {t("dashboard.currency")}</span>
                  <span className={`text-xs ${tx.status === "approved" ? "text-green-600" : "text-orange-500"}`}>
                    {tx.status === "approved" ? t("associations.page.approved") : t("associations.page.pending")}
                  </span>
                  {tx.type === "out" && tx.status !== "approved" && (
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => onApproveTransaction(tx.id ?? "")}>
                      {t("associations.page.approve")}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg shadow-slate-200/40 dark:bg-slate-800">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-slate-900 dark:text-white">{t("associations.page.membersTitle")}</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
              onClick={autoSortMembers}
              disabled={assoc?.lockOrder}
            >
              {t("associations.page.autoOrder")}
            </Button>
            <Button
              variant="outline"
              className="w-full border-primary/40 px-4 text-sm font-semibold text-primary hover:bg-primary/10 dark:border-primary/40 dark:text-primary sm:w-auto"
              onClick={() => setMembers((list) => [...list, { name: "", phone: "", turnOrder: list.length + 1, isPaid: false, isReceiver: false }])}
            >
              <Plus size={16} /> {t("associations.page.addMember")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400">{t("associations.page.noMembers")}</div>
          )}
          {members.map((m, idx) => (
            <div key={m.id ?? idx} className="rounded-2xl border border-slate-100 p-3 dark:border-slate-700">
              <div className="mb-3 text-xs text-slate-400">{idx + 1}</div>
              <div className="grid gap-3 md:grid-cols-12 md:items-center">
              <Input
                className="md:col-span-4 dark:bg-slate-900"
                placeholder={t("associations.page.memberName")}
                value={m.name ?? ""}
                onChange={(e) => setMembers((list) => list.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))}
              />
              <Input
                className="md:col-span-3 dark:bg-slate-900"
                placeholder={t("associations.page.memberPhone")}
                value={m.phone ?? ""}
                onChange={(e) => setMembers((list) => list.map((x, i) => (i === idx ? { ...x, phone: e.target.value } : x)))}
              />
              <Input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                className="md:col-span-2 dark:bg-slate-900"
                placeholder={t("associations.page.turnOrder")}
                value={m.turnOrder ?? idx + 1}
                onChange={(e) =>
                  setMembers((list) => list.map((x, i) => (i === idx ? { ...x, turnOrder: Number(e.target.value) } : x)))
                }
                disabled={assoc?.lockOrder}
              />
              <div className="flex flex-wrap gap-2 md:col-span-3 md:justify-end">
                <Button
                  variant="outline"
                  className={`min-h-10 px-3 text-xs font-bold rounded-lg border ${
                    m.isPaid
                      ? "border-green-300 text-green-600 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                      : "border-slate-200 text-slate-700 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                  }`}
                  onClick={async () => {
                    const nextMembers = members.map((x, i) => (i === idx ? { ...x, isPaid: !x.isPaid } : x));
                    setMembers(nextMembers);
                    await saveMembersQuick(nextMembers);
                  }}
                  disabled={isUpdatingPayments}
                >
                  {m.isPaid ? t("associations.page.paid") : t("associations.page.unpaid")}
                </Button>
                {form.associationKind !== "family" && (
                  <Button
                    variant="outline"
                    className={`min-h-10 px-3 text-xs font-bold rounded-lg border ${
                      m.isReceiver
                        ? "border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700"
                        : "border-slate-200 text-slate-700 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                    }`}
                    onClick={() =>
                      setMembers((list) =>
                        list.map((x, i) => (i === idx ? { ...x, isReceiver: true } : { ...x, isReceiver: false }))
                      )
                    }
                  >
                    {t("associations.page.receiver")}
                  </Button>
                )}
              <Button
                variant="outline"
                className="h-10 w-10 p-0 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                onClick={() => moveMember(idx, -1)}
                disabled={assoc?.lockOrder}
              >
                  <ChevronUp size={16} />
                </Button>
              <Button
                variant="outline"
                className="h-10 w-10 p-0 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                onClick={() => moveMember(idx, 1)}
                disabled={assoc?.lockOrder}
              >
                  <ChevronDown size={16} />
                </Button>
              <Button
                variant="outline"
                className="h-10 w-10 p-0 rounded-lg text-red-500 border-red-200 bg-white hover:bg-red-50 dark:bg-slate-900 dark:border-red-900/30"
                onClick={() => setMembers((list) => list.filter((_, i) => i !== idx))}
              >
                <Trash2 size={16} />
              </Button>
              </div>
            </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg shadow-slate-200/40 dark:bg-slate-800">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-slate-900 dark:text-white">{t("associations.page.paymentsTitle")}</CardTitle>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() =>
                exportToCsv("association_payments", assoc?.paymentLogs ?? [], {
                  memberName: t("associations.page.memberName"),
                  amount: t("associations.page.fundAmount"),
                  paidAt: t("associations.page.paymentsDate"),
                  month: t("associations.page.historyMonth"),
                } as any)
              }
            >
              {t("associations.page.exportPayments")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(assoc?.paymentLogs ?? []).length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400">{t("associations.page.paymentsEmpty")}</div>
          )}
          {(assoc?.paymentLogs ?? []).map((p, idx) => (
            <div key={p.id ?? idx} className="flex flex-col gap-1 border-b border-slate-100 pb-3 text-sm dark:border-slate-700/50 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-semibold">{p.memberName ?? "-"}</div>
              <div className="text-slate-500">{p.amount ?? 0} {t("dashboard.currency")}</div>
              <div className="text-slate-500">{p.paidAt ? p.paidAt.slice(0, 10) : "-"}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg shadow-slate-200/40 dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">{t("associations.page.historyTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(assoc?.cycleHistory ?? []).length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400">{t("associations.page.historyEmpty")}</div>
          )}
          {(assoc?.cycleHistory ?? []).map((h, idx) => (
            <div key={`${h.month}-${idx}`} className="flex flex-col gap-1 border-b border-slate-100 pb-3 text-sm dark:border-slate-700/50 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-semibold">{t("associations.page.historyMonth")} {h.month}</div>
              <div className="text-slate-500">{t("associations.page.historyReceiver")} {h.receiverName ?? "-"}</div>
              <div className="text-slate-500">{t("associations.page.historyPaidCount")} {h.paidCount ?? 0}</div>
              <div className="text-slate-500">{t("associations.page.historyTotalCollected")} {h.totalCollected ?? 0} {t("dashboard.currency")}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl border-red-200 dark:bg-slate-900">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("common.confirm")}</h2>
              <p className="text-slate-500 mb-6">{t("associations.page.deleteConfirm")}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDelete(false)}>{t("common.cancel")}</Button>
                <Button variant="destructive" className="flex-1" onClick={onDelete}>{t("common.delete")}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
