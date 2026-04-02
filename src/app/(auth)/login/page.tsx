"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { login } from "@/lib/api";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await login({ email, password });
      const redirect = searchParams.get("redirect");
      router.push(redirect ? decodeURIComponent(redirect) : "/dashboard");
    } catch (err: any) {
      const key = err?.messageKey as string | undefined;
      setError(key ? t(key) : err?.message ?? "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md mx-auto relative z-10">
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t("auth.login.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {t("auth.login.subtitle")}
        </p>
      </div>

      <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-600"></div>
        <CardContent className="p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-slate-300">{t("auth.login.emailLabel")}</Label>
              <Input
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.login.emailPlaceholder")}
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-slate-300">{t("auth.login.passwordLabel")}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.login.passwordPlaceholder")}
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
                dir="ltr"
              />
              <div className="flex justify-end pt-1">
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-secondary dark:hover:text-blue-400 transition-colors">
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base shadow-xl shadow-primary/20 mt-4 active:scale-95 transition-transform" disabled={isLoading}>
              {isLoading ? t("auth.login.loading") : t("auth.login.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-slate-600 dark:text-slate-400 mt-10">
        {t("auth.login.noAccount")}{" "}
        <Link href="/register" className="font-semibold text-primary hover:text-secondary dark:hover:text-blue-400 transition-colors underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
          {t("auth.login.registerLink")}
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="w-full max-w-md mx-auto relative z-10" />}>
      <LoginPageContent />
    </Suspense>
  );
}
