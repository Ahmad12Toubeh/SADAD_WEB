"use client";

import { Users, Calendar, DollarSign, Plus, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Association, createAssociation, listAssociations } from "@/lib/api";
import Link from "next/link";

export default function AssociationsPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    members: "10",
    monthlyAmount: "500",
    associationKind: "rotating" as "rotating" | "family",
  });

  const reload = async () => {
    try {
      const res = await listAssociations();
      setItems(res.items ?? []);
    } catch (err: any) {
       console.error("Reload failed", err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await listAssociations();
        if (!cancelled) setItems(res.items ?? []);
      } catch (err: any) {
        const key = err?.messageKey as string | undefined;
        if (!cancelled) setError(key ? t(key) : err?.message ?? "Failed to load associations");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const membersNum = Number(createForm.members);
      const monthlyNum = Number(createForm.monthlyAmount);
      if (!createForm.name.trim() || !Number.isFinite(membersNum) || membersNum < 2 || !Number.isFinite(monthlyNum) || monthlyNum < 1) {
        setError(t("errors.validation.invalid"));
        setIsSaving(false);
        return;
      }
      await createAssociation({
        name: createForm.name.trim(),
        members: membersNum,
        monthlyAmount: monthlyNum,
        associationKind: createForm.associationKind,
      });
      await reload();
      setIsCreateOpen(false);
      setCreateForm({ name: "", members: "10", monthlyAmount: "500", associationKind: "rotating" });
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to create association");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("associations.page.title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{t("associations.page.subtitle")}</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => setIsCreateOpen((v) => !v)}>
          {isCreateOpen ? <X size={18} /> : <Plus size={18} />}
          {isCreateOpen ? t("associations.page.closeBtn") : t("associations.page.createBtn")}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {isCreateOpen && (
        <Card className="border-0 shadow-2xl shadow-primary/5 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-8">
            <form onSubmit={onCreate} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-500 dark:text-slate-400">{t("associations.form.name")}</label>
                 <Input required placeholder={t("associations.form.name")} value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} className="bg-white dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-500 dark:text-slate-400">{t("associations.form.members")}</label>
                 <Input
                   required
                   type="number"
                   min={2}
                   step={1}
                   inputMode="numeric"
                   placeholder="10"
                   value={createForm.members}
                   onChange={(e) => setCreateForm((f) => ({ ...f, members: e.target.value }))}
                   className="bg-white dark:bg-slate-800"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-500 dark:text-slate-400">{t("associations.form.amount")}</label>
                 <Input
                   required
                   type="number"
                   min={1}
                   step="0.01"
                   inputMode="decimal"
                   placeholder="500"
                   value={createForm.monthlyAmount}
                   onChange={(e) => setCreateForm((f) => ({ ...f, monthlyAmount: e.target.value }))}
                   className="bg-white dark:bg-slate-800"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-500 dark:text-slate-400">{t("associations.form.kind")}</label>
                 <select
                   value={createForm.associationKind}
                   onChange={(e) => setCreateForm((f) => ({ ...f, associationKind: e.target.value as any }))}
                   className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 text-sm"
                 >
                   <option value="rotating">{t("associations.form.kindRotating")}</option>
                   <option value="family">{t("associations.form.kindFamily")}</option>
                 </select>
              </div>
              <div className="md:col-span-2 pt-2">
                <Button disabled={isSaving} type="submit" className="w-full sm:w-auto px-10 h-11 text-base">
                  {isSaving ? t("common.loading") : t("associations.page.saveBtn")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {(isLoading ? [] : items).map((assoc) => {
          const paidCount = (assoc.membersList ?? []).filter((m) => m.isPaid).length;
          const progressPercent = assoc.members > 0 ? Math.round((paidCount / assoc.members) * 100) : 0;
          const receiver = (assoc.membersList ?? []).find((m) => m.isReceiver);

          return (
            <Card key={assoc.id} className="border-0 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/20 rounded-3xl overflow-hidden dark:bg-slate-800">
              <div className="bg-slate-900 dark:bg-slate-950 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-2xl">
                      <Users size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl leading-tight">{assoc.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        {assoc.members} {t("associations.form.member")} • {assoc.monthlyAmount.toLocaleString()} {t("associations.form.currency")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full uppercase tracking-wider">
                    {assoc.associationKind === "family" ? t("associations.page.family") : t("associations.page.active")}
                  </span>
                </div>
              </div>

              <CardContent className="p-8 space-y-7">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                    <span>{t("associations.page.progress")}: <strong className="text-slate-900 dark:text-white">{paidCount}</strong> {t("associations.page.from")} <strong>{assoc.members}</strong></span>
                    <span className="text-primary">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 shadow-sm shadow-primary/30"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 flex items-center gap-4 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-slate-400"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{t("associations.form.kind")}</p>
                      <p className="font-black text-slate-900 dark:text-white text-lg">
                        {assoc.associationKind === "family" ? t("associations.form.kindFamily") : t("associations.form.kindRotating")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 flex items-center gap-4 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-slate-400"><DollarSign size={20} /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{t("associations.page.value")}</p>
                      <p className="font-black text-slate-900 dark:text-white text-lg">{assoc.totalValue.toLocaleString()} {t("dashboard.currency")}</p>
                    </div>
                  </div>
                </div>

                {/* Turn Status Alert */}
                {receiver ? (
                  <div className="flex items-center gap-3 text-green-700 bg-green-50 dark:bg-green-500/10 px-5 py-4 rounded-2xl border border-green-100 dark:border-green-500/20">
                    <Trophy size={20} className="text-green-600" />
                    <span className="font-black text-sm">{t("associations.page.currentReceiver")} {receiver.name || "-"}</span>
                  </div>
                ) : (
                  <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 px-5 py-4 rounded-2xl text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-3">
                    <Clock size={18} className="text-primary hidden sm:block" />
                    <span>{t("associations.page.noReceiver")}</span>
                  </div>
                )}

                <Link href={`/dashboard/associations/${assoc.id}`}>
                  <Button variant="outline" className="w-full h-11 font-bold dark:border-slate-700 dark:hover:bg-slate-700">
                    {t("associations.page.detailsBtn")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
        {isLoading && (
          <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={`sk-${i}`} className="border border-slate-200 dark:border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {!isLoading && items.length === 0 && (
          <div className="md:col-span-2">
            <EmptyState
              title={t("associations.page.empty")}
              description={t("associations.page.subtitle")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Clock({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
