"use client";

import { Users, Calendar, DollarSign, Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { listAssociations } from "@/lib/api";

export default function AssociationsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">جمعيتك (Jam&apos;eya)</h1>
          <p className="text-slate-500 mt-2 text-sm">تتبع جمعياتك المالية وأدوار الاستلام الشهرية.</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          إنشاء جمعية جديدة
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {(isLoading ? [] : items).map((assoc) => {
          const progressPercent = Math.round((assoc.currentMonth / assoc.members) * 100);
          const myTurnPassed = assoc.currentMonth >= assoc.myTurn;

          return (
            <Card key={assoc.id} className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
              <div className="bg-secondary px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-xl">
                      <Users size={22} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{assoc.name}</h3>
                      <p className="text-slate-400 text-sm">{assoc.members} أعضاء • {assoc.monthlyAmount.toLocaleString()} ر.س / شهر</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full">
                    نشطة
                  </span>
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium text-slate-600">
                    <span>الشهر الحالي: <strong className="text-slate-900">{assoc.currentMonth}</strong> من <strong>{assoc.members}</strong></span>
                    <span className="text-primary font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                    <Calendar size={18} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">دوري للاستلام</p>
                      <p className="font-black text-slate-900">الشهر {assoc.myTurn}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                    <DollarSign size={18} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">قيمة استلامي</p>
                      <p className="font-black text-slate-900">{assoc.totalValue.toLocaleString()} ر.س</p>
                    </div>
                  </div>
                </div>

                {myTurnPassed ? (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                    <Trophy size={18} className="text-green-600" />
                    <span className="font-semibold text-sm">استلمت دورك! ✅</span>
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/10 px-4 py-3 rounded-xl text-sm text-slate-600 font-medium">
                    متبقي <strong className="text-primary">{assoc.myTurn - assoc.currentMonth} شهر</strong> لحلول دورك في الاستلام.
                  </div>
                )}

                <Button variant="outline" className="w-full">عرض تفاصيل وأعضاء الجمعية</Button>
              </CardContent>
            </Card>
          );
        })}
        {!isLoading && items.length === 0 && (
          <div className="text-sm text-slate-500">لا توجد جمعيات حالياً.</div>
        )}
      </div>
    </div>
  );
}
