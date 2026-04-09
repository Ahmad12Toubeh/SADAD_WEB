"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Banknote, Crown, Clock3, Save, RefreshCw, UserRoundCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  assignOwnerSubscription,
  createOwnerSubscriptionPlan,
  getOwnerOverview,
  getSettingsProfile,
  listOwnerSubscriptionPlans,
  listSubscriptionAdminUsers,
  updateOwnerSubscriptionPlan,
  type OwnerOverview,
  type OwnerSubscriptionPlan,
  type SubscriptionAdminUser,
} from "@/lib/api";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [plans, setPlans] = useState<OwnerSubscriptionPlan[]>([]);
  const [users, setUsers] = useState<SubscriptionAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanMonths, setNewPlanMonths] = useState(1);
  const [newPlanPrice, setNewPlanPrice] = useState(99);
  const [newPlanDescription, setNewPlanDescription] = useState("");

  const [editingPlanId, setEditingPlanId] = useState("");
  const [editingPlanName, setEditingPlanName] = useState("");
  const [editingPlanMonths, setEditingPlanMonths] = useState(1);
  const [editingPlanPrice, setEditingPlanPrice] = useState(0);
  const [editingPlanDescription, setEditingPlanDescription] = useState("");
  const [editingPlanActive, setEditingPlanActive] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getSettingsProfile();
      const role = String(profile?.role ?? "").toLowerCase();
      const isAllowed = role === "admin" || role === "owner";
      setAllowed(isAllowed);
      if (!isAllowed) return;

      const [ov, pl, us] = await Promise.all([
        getOwnerOverview(),
        listOwnerSubscriptionPlans(),
        listSubscriptionAdminUsers(),
      ]);
      setOverview(ov);
      setPlans(pl);
      setUsers(us);
      if (!selectedUserId && us.length > 0) setSelectedUserId(us[0].id);
      if (!selectedPlanId && pl.length > 0) setSelectedPlanId(pl[0].id);
    } catch (err: any) {
      setError(err?.message ?? "تعذر تحميل بيانات لوحة المالك.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (allowed === false) {
      router.replace("/dashboard");
    }
  }, [allowed, router]);

  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId) ?? null, [plans, selectedPlanId]);

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) {
      setError("اسم الخطة مطلوب.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await createOwnerSubscriptionPlan({
        name: newPlanName.trim(),
        months: newPlanMonths,
        price: newPlanPrice,
        currency: "JOD",
        description: newPlanDescription.trim() || undefined,
        isActive: true,
      });
      setPlans((prev) => [created, ...prev]);
      setSelectedPlanId(created.id);
      setNewPlanName("");
      setNewPlanMonths(1);
      setNewPlanPrice(99);
      setNewPlanDescription("");
      setSuccess("تم إنشاء الخطة بنجاح.");
    } catch (err: any) {
      setError(err?.message ?? "فشل إنشاء الخطة.");
    } finally {
      setSaving(false);
    }
  };

  const startEditPlan = (plan: OwnerSubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setEditingPlanName(plan.name);
    setEditingPlanMonths(plan.months);
    setEditingPlanPrice(plan.price);
    setEditingPlanDescription(plan.description ?? "");
    setEditingPlanActive(plan.isActive);
  };

  const handleUpdatePlan = async () => {
    if (!editingPlanId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateOwnerSubscriptionPlan(editingPlanId, {
        name: editingPlanName.trim(),
        months: editingPlanMonths,
        price: editingPlanPrice,
        description: editingPlanDescription.trim() || undefined,
        isActive: editingPlanActive,
      });
      setPlans((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSuccess("تم تحديث الخطة.");
    } catch (err: any) {
      setError(err?.message ?? "فشل تحديث الخطة.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignSubscription = async () => {
    if (!selectedUserId || !selectedPlanId) {
      setError("اختر العميل والخطة أولا.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await assignOwnerSubscription({
        userId: selectedUserId,
        planId: selectedPlanId,
        notes: assignNotes.trim() || undefined,
      });
      setSuccess(`تم تفعيل ${result.plan.name} للعميل ${result.fullName}.`);
      setAssignNotes("");
      await loadAll();
    } catch (err: any) {
      setError(err?.message ?? "فشل تفعيل الاشتراك.");
    } finally {
      setSaving(false);
    }
  };

  if (allowed === false && !loading) return null;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">لوحة المالك</h1>
        <p className="mt-2 text-sm text-slate-400">تحليل الأرباح والعملاء، إدارة خطط الاشتراك، وتفعيل اشتراك عميل.</p>
      </div>

      {error && <div className="rounded-lg border border-red-900/40 bg-red-900/20 px-4 py-3 text-sm font-medium text-red-200">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-900/40 bg-emerald-900/20 px-4 py-3 text-sm font-medium text-emerald-200">{success}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">عدد العملاء</p>
            <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-100">
              <Users size={18} className="text-cyan-400" />
              {loading ? "..." : (overview?.customersCount ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">إجمالي الأرباح المحصلة</p>
            <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-100">
              <Banknote size={18} className="text-emerald-400" />
              {loading ? "..." : `${(overview?.totalCollected ?? 0).toLocaleString()} ${overview?.currency ?? "JOD"}`}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">اشتراكات نشطة</p>
            <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-100">
              <Crown size={18} className="text-amber-400" />
              {loading ? "..." : (overview?.activeSubscriptions ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">تنتهي خلال 7 أيام</p>
            <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-100">
              <Clock3 size={18} className="text-orange-400" />
              {loading ? "..." : (overview?.expiringSoon ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Layers size={18} className="text-cyan-400" />
              إنشاء أو تعديل خطط الاشتراك
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-slate-700 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-100">إضافة خطة جديدة</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Input placeholder="اسم الخطة" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} />
                  <p className="text-xs text-slate-400">اسم يظهر للمالك عند اختيار أو تعديل الباقات، مثل: شهري أو 3 أشهر.</p>
                </div>
                <div className="space-y-1.5">
                  <Input type="number" min={1} max={24} placeholder="عدد الأشهر" value={newPlanMonths} onChange={(e) => setNewPlanMonths(Number(e.target.value))} />
                  <p className="text-xs text-slate-400">المدة الفعلية للخطة، وهي عدد الأشهر التي يبقى فيها الاشتراك فعالًا.</p>
                </div>
                <div className="space-y-1.5">
                  <Input type="number" min={0} placeholder="السعر" value={newPlanPrice} onChange={(e) => setNewPlanPrice(Number(e.target.value))} />
                  <p className="text-xs text-slate-400">قيمة الباقة كاملة، وليس سعرًا يوميًا أو شهريًا إلا إذا كانت الخطة مبنية على ذلك.</p>
                </div>
                <div className="space-y-1.5">
                  <Input placeholder="وصف مختصر (اختياري)" value={newPlanDescription} onChange={(e) => setNewPlanDescription(e.target.value)} />
                  <p className="text-xs text-slate-400">شرح بسيط يوضح ما تتضمنه الخطة أو لأي فئة من العملاء مناسبة.</p>
                </div>
              </div>
              <Button className="mt-3" disabled={saving} onClick={() => void handleCreatePlan()}>
                <Save size={16} />
                إنشاء الخطة
              </Button>
            </div>

            <div className="space-y-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => startEditPlan(plan)}
                  className={`w-full rounded-xl border px-4 py-3 text-start transition ${
                    editingPlanId === plan.id ? "border-cyan-500 bg-cyan-500/10" : "border-slate-700 hover:bg-slate-800/70"
                  }`}
                >
                  <p className="font-semibold text-slate-100">{plan.name}</p>
                  <p className="text-xs text-slate-400">{plan.months} شهر - {plan.price} {plan.currency} - {plan.isActive ? "نشطة" : "متوقفة"}</p>
                </button>
              ))}
            </div>

            {editingPlanId && (
              <div className="rounded-xl border border-slate-700 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-100">تعديل الخطة</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={editingPlanName} onChange={(e) => setEditingPlanName(e.target.value)} />
                  <Input type="number" min={1} max={24} value={editingPlanMonths} onChange={(e) => setEditingPlanMonths(Number(e.target.value))} />
                  <Input type="number" min={0} value={editingPlanPrice} onChange={(e) => setEditingPlanPrice(Number(e.target.value))} />
                  <Input value={editingPlanDescription} onChange={(e) => setEditingPlanDescription(e.target.value)} />
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={editingPlanActive} onChange={(e) => setEditingPlanActive(e.target.checked)} />
                  الخطة نشطة
                </label>
                <Button className="mt-3" disabled={saving} onClick={() => void handleUpdatePlan()}>
                  <Save size={16} />
                  حفظ التعديل
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <UserRoundCheck size={18} className="text-cyan-400" />
              تفعيل اشتراك لعميل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">اختيار العميل</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.fullName} - {user.email}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400">الحساب الذي سيتم ربط الاشتراك المدفوع به وتفعيل الوصول له.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">اختيار الخطة</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100"
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.name} - {plan.months} شهر - {plan.price} {plan.currency}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400">الخطة التي سيتم تطبيقها على العميل، وهي تحدد المدة والسعر والاسم الداخلي للباقة.</p>
              {selectedPlan && <p className="text-xs text-slate-400">الخطة المختارة: {selectedPlan.name} ({selectedPlan.months} شهر)</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">ملاحظات (اختياري)</label>
              <Input value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} placeholder="مثال: تم الدفع كاش" />
              <p className="text-xs text-slate-400">ملاحظة داخلية لك وللفريق، مثل طريقة الدفع أو أي اتفاق خاص مع العميل.</p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" disabled={saving || loading} onClick={() => void handleAssignSubscription()}>
                {saving ? "جار التنفيذ..." : "تفعيل الاشتراك"}
              </Button>
              <Button variant="outline" disabled={saving || loading} onClick={() => void loadAll()}>
                <RefreshCw size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
