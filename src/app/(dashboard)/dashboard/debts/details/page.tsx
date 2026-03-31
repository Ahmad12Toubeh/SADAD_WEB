"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, AlertCircle, FileSpreadsheet, Download, UserCheck, Phone, ShieldAlert, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"; // Assuming we have a standard dialog component, if not I'll use standard framer-motion modal inside

export default function DebtDetailsPage() {
  const { t, i18n } = useTranslation();
  const [isGuarantorActive, setIsGuarantorActive] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  const mockInstallments = [
    { id: 1, amount: 5000, due: "2024-04-10", status: "paid" },
    { id: 2, amount: 5000, due: "2024-05-10", status: "late" },
    { id: 3, amount: 5000, due: "2024-06-10", status: "pending" },
    { id: 4, amount: 5000, due: "2024-07-10", status: "pending" },
  ];

  const total = 20000;
  const paid = 5000;
  const progress = (paid / total) * 100;
  const hasLateInstallment = mockInstallments.some(inst => inst.status === "late");

  const handleActivateGuarantor = () => {
    // Simulate API call
    setTimeout(() => {
      setIsGuarantorActive(true);
      setShowActivateModal(false);
      setActivationSuccess(true);
      setTimeout(() => setActivationSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers/1">
            <Button variant="ghost" className="px-2 dark:hover:bg-slate-800 transition-colors">
              {i18n.dir() === 'rtl' ? <ArrowRight size={24} className="text-slate-500 hover:text-slate-900 dark:hover:text-white" /> : <ArrowLeft size={24} className="text-slate-500 hover:text-slate-900 dark:hover:text-white" />}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">تفاصيل المديونية #101</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm font-medium flex items-center gap-2">
               مخصصة بضاعة من متجر الأمل <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full inline-block"></span> العميل: شركة الأفق المحدودة
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 hidden sm:flex dark:border-slate-700 dark:hover:bg-slate-800">
             <Download size={16} /> تحميل PDF
          </Button>
          <Button className="gap-2 shadow-sm shadow-primary/20">
             <FileSpreadsheet size={16} /> إصدار فاتورة نهائية
          </Button>
        </div>
      </div>

      {activationSuccess && (
        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-full">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="font-bold text-lg">{t("guarantor.modal.success")}</h4>
          </div>
        </div>
      )}

      {/* Guarantor Section */}
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 px-1">{t("guarantor.sectionTitle")}</h3>
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full flex-shrink-0 ${isGuarantorActive ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 relative' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                {isGuarantorActive ? <ShieldAlert size={28} /> : <UserCheck size={28} />}
                {isGuarantorActive && <span className="absolute top-0 end-0 w-3 h-3 bg-red-500 rounded-full border-2 border-orange-100 dark:border-slate-900 animate-pulse"></span>}
              </div>
              <div className="text-start">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("guarantor.name")}</p>
                <h4 className="font-bold text-xl text-slate-900 dark:text-white mt-0.5">أحمد محمد عبدالله</h4>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1" dir="ltr">
                  <Phone size={14} className="text-slate-400"/> +966 50 123 4567
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              {isGuarantorActive ? (
                <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 px-4 py-1.5 rounded-full font-bold text-sm w-max inline-flex items-center gap-2">
                  <ShieldAlert size={16} /> {t("guarantor.status.active")}
                </span>
              ) : (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full font-bold text-sm w-max">
                  {t("guarantor.status.inactive")}
                </span>
              )}

              {/* Smart Alert Logic */}
              {hasLateInstallment && !isGuarantorActive && (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2 border-t md:border-t-0 md:border-s border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:ps-4">
                  <p className="text-xs font-bold text-red-500 dark:text-red-400 flex items-center gap-1.5 max-w-[200px] text-center sm:text-start leading-tight">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {t("guarantor.alert")}
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto shadow-lg shadow-red-500/20 gap-2"
                    onClick={() => setShowActivateModal(true)}
                  >
                    <ShieldAlert size={16} /> {t("guarantor.activateBtn")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary Card */}
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 px-1 mt-10">ملخص الذمة والمتبقي</h3>
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900/50">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <p className="text-base font-medium text-slate-500 dark:text-slate-400 mb-1">المبلغ الإجمالي للدين</p>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{total.toLocaleString()} <span className="text-xl text-slate-400 font-bold">ر.س</span></h2>
            </div>
            <div className="text-left bg-green-50 dark:bg-green-500/10 px-6 py-4 rounded-xl border border-green-100 dark:border-green-500/20 w-full md:w-auto">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">إجمالي ما تم سداده</p>
              <p className="text-2xl font-black text-green-700 dark:text-green-400">{paid.toLocaleString()} ر.س</p>
            </div>
          </div>
          
          <div className="relative w-full h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
             <div 
               className="h-full bg-primary/90 transition-all duration-1000 ease-out flex items-center justify-end px-2" 
               style={{ width: `${progress}%` }} 
             >
               {progress > 10 && <span className="text-[10px] font-black text-white">{progress}%</span>}
             </div>
          </div>
          <div className="flex justify-between mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">
            <span className="text-primary dark:text-blue-400">{progress}% نسبة الإكتمال</span>
            <span className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full">المبلغ المتبقي المعلق: {(total - paid).toLocaleString()} ر.س</span>
          </div>
        </CardContent>
      </Card>

      <div>
         <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 px-1 tracking-tight">جدولة الأقساط والدفعات المتأخرة</h3>
         <div className="space-y-4">
           {mockInstallments.map((inst, index) => (
             <div key={inst.id} className={`rounded-xl border shadow-sm transition-all hover:shadow-md ${
               inst.status === 'paid' ? 'border-l-[6px] border-l-green-500 bg-green-50/40 dark:bg-green-500/5 border-slate-100 dark:border-slate-800' : 
               inst.status === 'late' ? 'border-l-[6px] border-l-red-500 bg-white dark:bg-slate-900 border-red-100 dark:border-red-900/50 shadow-red-500/5 overflow-hidden ring-1 ring-red-500/10 dark:ring-red-500/20' : 
               'border-l-[6px] border-l-primary/30 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
             }`}>
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                 
                 <div className="flex items-center gap-5 w-full sm:w-auto">
                   <div className={`p-3 rounded-full ${inst.status === 'paid' ? 'bg-green-100 dark:bg-green-500/20' : inst.status === 'late' ? 'bg-red-100 dark:bg-red-500/20 animate-pulse' : 'bg-slate-100 dark:bg-slate-800'}`}>
                     {inst.status === 'paid' && <CheckCircle2 className="text-green-600 dark:text-green-400" size={28} />}
                     {inst.status === 'late' && <AlertCircle className="text-red-600 dark:text-red-400" size={28} />}
                     {inst.status === 'pending' && <Clock className="text-slate-400" size={28} />}
                   </div>
                   
                   <div>
                     <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">الدفعة الشهرية رقم {index + 1}</h4>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1.5">
                        الاستحقاق: <strong className="text-slate-700 dark:text-slate-300" dir="ltr">{inst.due}</strong>
                        {inst.status === 'late' ? <span className="text-[11px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full mr-2 font-bold">تجاوزت الموعد!</span> : ''}
                     </p>
                   </div>
                 </div>

                 <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                   <div className="text-left font-black text-2xl text-slate-900 dark:text-white whitespace-nowrap">
                     {inst.amount.toLocaleString()} <span className="text-sm text-slate-500 font-bold">ر.س</span>
                   </div>

                   <div className="w-36 flex justify-end shrink-0">
                     {inst.status === 'paid' ? (
                       <span className="text-sm font-bold text-green-700 dark:text-green-400 bg-green-200/50 dark:bg-green-500/20 px-4 py-2 rounded-full inline-flex items-center gap-2">
                         <CheckCircle2 size={16} /> مدفوعة
                       </span>
                     ) : (
                       <Button 
                         variant={inst.status === 'late' ? 'primary' : 'outline'}
                         className={`font-semibold ${inst.status === 'late' ? 'bg-red-500 hover:bg-red-600 text-white w-full shadow-lg shadow-red-500/20' : 'w-full border-2 dark:border-slate-700 dark:hover:bg-slate-800'}`}
                       >
                         تسجيل كسداد 💵
                       </Button>
                     )}
                   </div>
                 </div>
                 
               </div>
             </div>
           ))}
         </div>
      </div>

      {/* Confirmation Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 text-orange-600 dark:text-orange-500">
              <div className="bg-orange-100 dark:bg-orange-500/20 p-3 rounded-full">
                <ShieldAlert size={28} />
              </div>
              <h2 className="text-xl font-bold">{t("guarantor.modal.title")}</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {t("guarantor.modal.desc")}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-2xl">
              <Button variant="ghost" onClick={() => setShowActivateModal(false)} className="dark:hover:bg-slate-800">
                {t("guarantor.modal.cancel")}
              </Button>
              <Button onClick={handleActivateGuarantor} className="bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 border-0">
                {t("guarantor.modal.confirm")} <Check className="ml-2 rtl:mr-2 rtl:ml-0" size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
