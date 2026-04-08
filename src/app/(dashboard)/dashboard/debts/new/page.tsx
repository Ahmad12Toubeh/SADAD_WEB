"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, UserCircle, Calculator, FileText, CheckCircle2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { createDebt, getCustomer, listCustomers, uploadImage } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidJordan07Phone, JORDAN_07_PHONE_HINT, sanitizeJordan07PhoneInput } from "@/lib/phone";

function NewDebtWizardContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initFromQuery = useRef(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasGuarantor, setHasGuarantor] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [initialPaymentAmount, setInitialPaymentAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("t1");
  const [notes, setNotes] = useState("");

  const [planType, setPlanType] = useState<"one_time" | "installments">("one_time");
  const [installmentCount, setInstallmentCount] = useState("");
  const [installmentPeriod, setInstallmentPeriod] = useState<"monthly" | "weekly">("monthly");

  const [guarantorName, setGuarantorName] = useState("");
  const [guarantorPhone, setGuarantorPhone] = useState("");
  const [guarantorNotes, setGuarantorNotes] = useState("");
  const [guarantorProofImageUrl, setGuarantorProofImageUrl] = useState<string | null>(null);
  const [guarantorProofImagePublicId, setGuarantorProofImagePublicId] = useState<string | null>(null);
  const [isUploadingGuarantorProof, setIsUploadingGuarantorProof] = useState(false);

  const handleGuarantorPhoneChange = (value: string) => {
    setGuarantorPhone(sanitizeJordan07PhoneInput(value));
  };

  const steps = [
    { id: 1, title: t("debts.new.steps.step1"), icon: UserCircle },
    { id: 2, title: t("debts.new.steps.step2"), icon: FileText },
    { id: 3, title: t("debts.new.steps.step3"), icon: Calculator },
    { id: 4, title: t("guarantor.title"), icon: UserCheck },
    { id: 5, title: t("debts.new.steps.step4"), icon: CheckCircle2 },
  ];

  const formatMoney = (value: number) =>
    new Intl.NumberFormat(i18n.language.startsWith("ar") ? "ar-JO" : "en-GB", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(Number.isFinite(value) ? value : 0);

  useEffect(() => {
    if (initFromQuery.current) return;
    const stepParam = searchParams.get("step");
    const customerParam = searchParams.get("customerId");
    if (customerParam) {
      setCustomerId(customerParam);
      (async () => {
        try {
          const c = await getCustomer(customerParam);
          setSelectedCustomerName(c?.name ?? null);
        } catch {
          setSelectedCustomerName(null);
        }
      })();
    }
    if (stepParam) {
      const parsed = Number(stepParam);
      if (Number.isFinite(parsed)) {
        const clamped = Math.min(Math.max(parsed, 1), steps.length);
        setCurrentStep(clamped);
      }
    }
    initFromQuery.current = true;
  }, [searchParams, steps.length]);

  useEffect(() => {
    if (currentStep !== 1) return;
    if (customerResults.length > 0) return;
    (async () => {
      try {
        const res = await listCustomers();
        setCustomerResults(res.items ?? []);
      } catch {
        setCustomerResults([]);
      }
    })();
  }, [currentStep, customerResults.length]);

  const nextStep = () => {
    setError(null);
    if (currentStep === 1 && !customerId) {
      setError(t("errors.validation.invalid"));
      return;
    }
    if (currentStep === 2) {
      const principalAmount = Number(amount);
      if (!Number.isFinite(principalAmount) || principalAmount <= 0) {
        setError(t("errors.validation.invalid"));
        return;
      }
      const initialPayment = Number(initialPaymentAmount || 0);
      if (!Number.isFinite(initialPayment) || initialPayment < 0 || initialPayment > principalAmount) {
        setError(t("debts.new.s2.initialPaymentValidation"));
        return;
      }
    }
    if (currentStep === 3 && planType === "installments") {
      const count = Number(installmentCount);
      if (!Number.isFinite(count) || count < 1) {
        setError(t("errors.validation.invalid"));
        return;
      }
    }
    if (currentStep === 4 && hasGuarantor && !isValidJordan07Phone(guarantorPhone)) {
      setError(JORDAN_07_PHONE_HINT);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleGuarantorProofUpload = async (file: File) => {
    setError(null);
    setIsUploadingGuarantorProof(true);
    try {
      const uploaded = await uploadImage(file, "sadad/guarantors");
      setGuarantorProofImageUrl(uploaded.url);
      setGuarantorProofImagePublicId(uploaded.publicId);
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to upload proof image");
    } finally {
      setIsUploadingGuarantorProof(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!customerId) throw new Error("Customer is required");
      const principalAmount = Number(amount);
      if (!Number.isFinite(principalAmount) || principalAmount <= 0) throw new Error("Invalid amount");
      const initialPayment = Number(initialPaymentAmount || 0);
      if (!Number.isFinite(initialPayment) || initialPayment < 0 || initialPayment > principalAmount) {
        throw new Error(t("debts.new.s2.initialPaymentValidation"));
      }

      const res = await createDebt({
        customerId,
        principalAmount,
        initialPaymentAmount: initialPayment || undefined,
        currency: "JOD",
        planType,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        category: category || "t1",
        notes: notes || undefined,
        installmentsPlan: planType === "installments"
          ? { count: Number(installmentCount), period: installmentPeriod }
          : undefined,
        hasGuarantor,
        guarantor: hasGuarantor
          ? {
            name: guarantorName,
            phone: guarantorPhone,
            notes: guarantorNotes || undefined,
            proofImageUrl: guarantorProofImageUrl || undefined,
            proofImagePublicId: guarantorProofImagePublicId || undefined,
          }
          : undefined,
      });
      router.push(`/dashboard/debts/${res.debt.id}`);
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to create debt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("debts.new.title")}</h1>
        <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">{t("debts.new.subtitle")}</p>
      </div>

      {/* Stepper Progress */}
      <div className="relative">
        <div className="absolute top-5 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
        <div
          className="absolute top-5 h-0.5 bg-primary -z-10 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, [i18n.dir() === 'rtl' ? 'right' : 'left']: 0 }}
        ></div>

        <div className="flex justify-between">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? "bg-primary text-white ring-4 ring-primary/20" :
                    isCompleted ? "bg-primary text-white" : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400"
                    }`}
                >
                  {isCompleted ? <Check size={20} /> : <step.icon size={20} />}
                </div>
                <span className={`mt-2 text-xs font-medium ${isActive ? "text-primary dark:text-primary" : "text-slate-500 dark:text-slate-400"} hidden sm:block`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-800 min-h-[400px]">
        <CardContent className="p-8 overflow-hidden">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: i18n.dir() === 'rtl' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: i18n.dir() === 'rtl' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{t("debts.new.stepTitles.s1")}</h2>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">{t("debts.new.s1.searchLabel")}</Label>
                    <Input
                      value={customerSearch}
                      onChange={async (e) => {
                        const v = e.target.value;
                        setCustomerSearch(v);
                        try {
                          const res = await listCustomers(v.trim() ? v : undefined);
                          setCustomerResults(res.items ?? []);
                        } catch {
                          setCustomerResults([]);
                        }
                      }}
                      placeholder={t("debts.new.s1.searchPlaceholder")}
                      className="h-11 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-start"
                    />
                    <div className="space-y-2 pt-2">
                      {customerResults.slice(0, 6).map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCustomerId(c.id);
                            setSelectedCustomerName(c.name);
                          }}
                          className={`w-full text-start px-4 py-3 rounded-lg border ${customerId === c.id ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            }`}
                        >
                          <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                          <div className="text-xs text-slate-500" dir="ltr">{c.phone}</div>
                        </button>
                      ))}
                      {customerId && <div className="text-xs text-green-600 dark:text-green-400">تم اختيار العميل</div>}
                    </div>
                  </div>
                  <div className="relative pt-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">{t("debts.new.s1.or")}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-dashed border-2 py-8 text-primary border-primary/40 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-primary/40 dark:text-primary dark:hover:bg-primary/10 text-base font-bold"
                    onClick={() => router.push("/dashboard/customers/new?returnTo=debt")}
                  >
                    <UserCircle size={20} className="mr-2 rtl:ml-2 rtl:mr-0 inline" />
                    {t("debts.new.s1.addNew")}
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{t("debts.new.stepTitles.s2")}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label className="dark:text-slate-300">{t("debts.new.s2.amount")}</Label>
                      <div className="flex h-16 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 dark:bg-slate-900 dark:border-slate-700">
                        <Input
                          type="number"
                          min={1}
                          step="0.001"
                          inputMode="decimal"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="h-full border-0 bg-transparent text-2xl font-bold text-end shadow-none focus-visible:ring-0 dark:bg-transparent dark:border-0"
                          dir="ltr"
                        />
                        <span className="shrink-0 text-slate-500 font-semibold text-lg">{t("dashboard.currency")}</span>
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label className="dark:text-slate-300">{t("debts.new.s2.initialPayment")}</Label>
                      <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 dark:bg-slate-900 dark:border-slate-700">
                        <Input
                          type="number"
                          min={0}
                          step="0.001"
                          inputMode="decimal"
                          value={initialPaymentAmount}
                          onChange={(e) => setInitialPaymentAmount(e.target.value)}
                          placeholder="0.00"
                          className="h-full border-0 bg-transparent text-end shadow-none focus-visible:ring-0 dark:bg-transparent dark:border-0"
                          dir="ltr"
                        />
                        <span className="shrink-0 text-slate-500 font-semibold">{t("dashboard.currency")}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("debts.new.s2.dueDate")}</Label>
                      <Input
                        type="date"
                        lang={i18n.language.startsWith("ar") ? "ar-EG" : "en-GB"}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="h-11 dark:bg-slate-900 dark:border-slate-700 text-start"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t("debts.new.s2.dueDateFormatHint")}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("debts.new.s2.type")}</Label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-start">
                        <option value="t1">{t("debts.new.s2.types.t1")}</option>
                        <option value="t2">{t("debts.new.s2.types.t2")}</option>
                        <option value="t3">{t("debts.new.s2.types.t3")}</option>
                      </select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label className="dark:text-slate-300">{t("debts.new.s2.notes")}</Label>
                      <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("debts.new.s2.notesPlaceholder")} className="h-11 dark:bg-slate-900 dark:border-slate-700 text-start" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{t("debts.new.stepTitles.s3")}</h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm">
                      <input type="radio" name="plan" className="w-5 h-5 text-primary" checked={planType === "one_time"} onChange={() => setPlanType("one_time")} />
                      <div className="text-start">
                        <p className="font-semibold text-slate-900 dark:text-white text-base">{t("debts.new.s3.oneTime")}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("debts.new.s3.oneTimeDesc")}</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-primary/30 bg-primary/5 dark:bg-primary/10 rounded-lg cursor-pointer transition-colors relative overflow-hidden shadow-sm">
                      <div className="absolute end-0 top-0 w-1 h-full bg-primary" />
                      <input type="radio" name="plan" className="w-5 h-5 text-primary" checked={planType === "installments"} onChange={() => setPlanType("installments")} />
                      <div className="text-start">
                        <p className="font-semibold text-slate-900 dark:text-white text-base">{t("debts.new.s3.installments")}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("debts.new.s3.installmentsDesc")}</p>
                      </div>
                    </label>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-lg mt-4 grid grid-cols-2 gap-4 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("debts.new.s3.count")}</Label>
                      <Input
                        type="number"
                        step={1}
                        inputMode="numeric"
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(e.target.value)}
                        className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("debts.new.s3.period")}</Label>
                      <select value={installmentPeriod} onChange={(e) => setInstallmentPeriod(e.target.value as any)} className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-start">
                        <option value="monthly">{t("debts.new.s3.periods.monthly")}</option>
                        <option value="weekly">{t("debts.new.s3.periods.weekly")}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex flex-col mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t("guarantor.title")}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t("guarantor.desc")}</p>
                  </div>

                  <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-50 dark:bg-slate-900/50">
                    <CardContent className="p-6">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <div className="text-start">
                          <p className="font-semibold text-slate-900 dark:text-white text-base">{t("guarantor.toggle")}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t("guarantor.desc")}
                          </p>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={hasGuarantor} onChange={() => setHasGuarantor(!hasGuarantor)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                        </div>
                      </label>
                    </CardContent>
                  </Card>

                  <AnimatePresence>
                    {hasGuarantor && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 mt-6">
                          <div className="space-y-2">
                            <Label className="dark:text-slate-300">{t("guarantor.name")}</Label>
                            <Input value={guarantorName} onChange={(e) => setGuarantorName(e.target.value)} placeholder={t("auth.register.namePlaceholder")} className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start" />
                          </div>
                          <div className="space-y-2">
                            <Label className="dark:text-slate-300">{t("guarantor.phone")}</Label>
                            <Input value={guarantorPhone} onChange={(e) => handleGuarantorPhoneChange(e.target.value)} type="tel" placeholder="07XXXXXXXX" dir="ltr" maxLength={10} className="h-11 text-start dark:bg-slate-950 dark:border-slate-800" />
                          </div>
                          <div className="space-y-2">
                            <Label className="dark:text-slate-300">{t("guarantor.notes")}</Label>
                            <Input value={guarantorNotes} onChange={(e) => setGuarantorNotes(e.target.value)} className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start" />
                          </div>

                          <ImageUploadField
                            inputId="guarantor-proof-image"
                            label="إثبات شخصي أو صورة الهوية للكفيل (اختياري)"
                            hint="ارفع صورة واضحة لهوية الكفيل أو أي إثبات شخصي."
                            previewUrl={guarantorProofImageUrl}
                            isUploading={isUploadingGuarantorProof}
                            onFileSelect={handleGuarantorProofUpload}
                            onRemove={() => {
                              setGuarantorProofImageUrl(null);
                              setGuarantorProofImagePublicId(null);
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("debts.new.stepTitles.s4")}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{t("debts.new.s4.desc")}</p>

                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 rounded-xl text-start mt-6 flex flex-col gap-4 shadow-sm">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                      <span className="text-slate-500 dark:text-slate-400">{t("debts.new.s4.customer")}</span>
                      <span className="font-semibold dark:text-white">{selectedCustomerName ?? customerId ?? "-"}</span>
                    </div>
                    {hasGuarantor && (
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 gap-4">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><UserCheck size={16} /> {t("guarantor.title")}</span>
                        <div className="flex items-center gap-3">
                          {guarantorProofImageUrl && (
                            <Link href={guarantorProofImageUrl} target="_blank" className="text-sm font-semibold text-primary hover:underline">
                              عرض الإثبات
                            </Link>
                          )}
                          <span className="font-semibold text-primary">{t("guarantor.status.active")}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                      <span className="text-slate-500 dark:text-slate-400">{t("debts.new.s4.total")}</span>
                      <span className="font-bold text-xl dark:text-white">{formatMoney(Number(amount || 0))} {t("dashboard.currency")}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                      <span className="text-slate-500 dark:text-slate-400">{t("debts.new.s2.initialPayment")}</span>
                      <span className="font-semibold dark:text-white">{formatMoney(Number(initialPaymentAmount || 0))} {t("dashboard.currency")}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                      <span className="text-slate-500 dark:text-slate-400">{t("debts.details.remainingAmount")}</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {formatMoney(Math.max(0, Number(amount || 0) - Number(initialPaymentAmount || 0)))} {t("dashboard.currency")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t("debts.new.s4.plan")}</span>
                      <span className="font-semibold text-primary text-lg">
                        {planType === "installments"
                          ? `${Number(installmentCount) || 0} ${t(`debts.new.s3.periods.${installmentPeriod}`)}`
                          : t("debts.new.s3.oneTime")
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
          className="gap-2 dark:hover:bg-slate-800 dark:text-slate-300 h-11 px-6 font-semibold"
        >
          {i18n.dir() === 'rtl' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {t("debts.new.nav.prev")}
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={nextStep} className="gap-2 px-8 h-11 text-base font-semibold shadow-md shadow-primary/20">
            {t("debts.new.nav.next")}
            {i18n.dir() === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="gap-2 px-8 h-11 text-base font-semibold bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white shadow-md shadow-green-500/20" disabled={isSubmitting || isUploadingGuarantorProof}>
            {isSubmitting ? t("debts.new.nav.saving") : t("debts.new.nav.confirm")}
            <Check size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NewDebtWizard() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto space-y-8 pb-12" />}>
      <NewDebtWizardContent />
    </Suspense>
  );
}
