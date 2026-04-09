"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { login, register as apiRegister } from "@/lib/api";
import { isValidJordan07Phone, JORDAN_07_PHONE_HINT, sanitizeJordan07PhoneInput } from "@/lib/phone";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handlePhoneChange = (value: string) => {
    setPhone(sanitizeJordan07PhoneInput(value));
  };

  const handleRegister = async () => {
    setError(null);
    if (!isValidJordan07Phone(phone)) {
      setError(JORDAN_07_PHONE_HINT);
      return;
    }
    setIsLoading(true);
    try {
      await apiRegister({ email, password, fullName, phone, storeName });
      await login({ email, password });
      const redirect = searchParams.get("redirect");
      router.push(redirect ? decodeURIComponent(redirect) : "/dashboard");
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Register failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md mx-auto relative z-10">
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t("auth.register.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {t("auth.register.subtitle")}
        </p>
      </div>

      <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-600"></div>
        <CardContent className="p-8">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              void handleRegister();
            }}
          >
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-slate-300">{t("auth.register.nameLabel")}</Label>
              <Input
                id="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("auth.register.namePlaceholder")}
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store" className="dark:text-slate-300">{t("settings.tabs.store")}</Label>
              <Input
                id="store"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={t("settings.store.storeName")}
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="dark:text-slate-300">{t("settings.profile.phone")}</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="07XXXXXXXX"
                dir="ltr"
                maxLength={10}
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-slate-300">{t("auth.login.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.login.emailPlaceholder")}
                dir="ltr"
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-slate-300">{t("auth.register.passwordLabel")}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.register.passwordPlaceholder")}
                dir="ltr"
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base shadow-xl shadow-primary/20 mt-4 active:scale-95 transition-transform"
              disabled={isLoading}
            >
              {isLoading ? t("auth.register.loading") : t("auth.register.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-slate-600 dark:text-slate-400 mt-8">
        {t("auth.register.haveAccount")}{"auth.register.haveAccount "}
        <Link href="/login" className="font-semibold text-primary hover:text-secondary dark:hover:text-blue-400 transition-colors underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
          {t("auth.register.loginLink")}
        </Link>
      </p>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="w-full max-w-md mx-auto relative z-10" />}>
      <RegisterPageContent />
    </Suspense>
  );
}
