"use client";

import { useTranslation } from "react-i18next";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, User, Building2, Phone, Mail, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { createCustomer } from "@/lib/api";

export default function NewCustomerPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [customerType, setCustomerType] = useState<"individual" | "company">("individual");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [cr, setCr] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const created = await createCustomer({
        type: customerType,
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
        cr: cr || undefined,
        notes: notes || undefined,
      });
      const returnTo = searchParams.get("returnTo");
      if (returnTo === "debt" && created?.id) {
        router.push(`/dashboard/debts/new?step=2&customerId=${created.id}`);
        return;
      }
      router.push("/dashboard/customers");
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customers">
          <Button variant="ghost" className="px-2 rtl:rotate-0 ltr:-rotate-180">
            <ArrowRight size={22} className="text-slate-500 dark:text-slate-400" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("customers.new.title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t("customers.new.subtitle")}</p>
        </div>
      </div>

      {/* Type Selector */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setCustomerType("individual")}
          className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-semibold transition-all ${
            customerType === "individual"
              ? "border-primary bg-primary/5 text-primary dark:bg-primary/20"
              : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <User size={20} />
          {t("customers.new.typeIndividual")}
        </button>
        <button
          type="button"
          onClick={() => setCustomerType("company")}
          className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-semibold transition-all ${
            customerType === "company"
              ? "border-primary bg-primary/5 text-primary dark:bg-primary/20"
              : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <Building2 size={20} />
          {t("customers.new.typeCompany")}
        </button>
      </div>

      <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-800 rounded-2xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-slate-300">
                {customerType === "individual" ? t("customers.new.fullName") : t("customers.new.companyName")}
              </Label>
              <div className="relative">
                <User size={18} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={customerType === "individual" ? t("customers.new.namePlaceholderIndividual") : t("customers.new.namePlaceholderCompany")}
                  className="pe-10 dark:bg-slate-900 dark:border-slate-700 text-start"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="dark:text-slate-300">{t("customers.new.phone")}</Label>
                <div className="relative">
                  <Phone size={18} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    className="pe-10 dark:bg-slate-900 dark:border-slate-700 text-start"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-slate-300">{t("customers.new.email")}</Label>
                <div className="relative">
                  <Mail size={18} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    dir="ltr"
                    className="pe-10 dark:bg-slate-900 dark:border-slate-700 text-start"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="dark:text-slate-300">{t("customers.new.address")}</Label>
              <div className="relative">
                <MapPin size={18} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t("customers.new.addressPlaceholder")}
                  className="pe-10 dark:bg-slate-900 dark:border-slate-700 text-start"
                />
              </div>
            </div>

            {customerType === "company" && (
              <div className="space-y-2">
                <Label htmlFor="cr" className="dark:text-slate-300">{t("customers.new.cr")}</Label>
                <Input
                  id="cr"
                  value={cr}
                  onChange={(e) => setCr(e.target.value)}
                  placeholder="1010xxxxxx"
                  dir="ltr"
                  className="dark:bg-slate-900 dark:border-slate-700 text-start"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="dark:text-slate-300">{t("customers.new.notes")}</Label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("customers.new.notesPlaceholder")}
                className="flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none text-start"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
                <Save size={18} />
                {isLoading ? t("customers.new.saving") : t("customers.new.save")}
              </Button>
              <Link href="/dashboard/customers" className="flex-1">
                <Button variant="outline" className="w-full dark:border-slate-700 dark:hover:bg-slate-700">{t("customers.new.cancel")}</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
