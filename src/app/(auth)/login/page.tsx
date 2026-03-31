"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { login, setAccessToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
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
      setAccessToken(res.accessToken);
      router.push("/dashboard");
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
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">{t("auth.login.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t("auth.login.subtitle")}</p>
      </div>

      <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
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
                <Link href="#" className="text-sm font-medium text-primary hover:text-secondary dark:hover:text-blue-400 transition-colors">
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base shadow-xl shadow-primary/20 mt-4" disabled={isLoading}>
              {isLoading ? t("auth.login.loading") : t("auth.login.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-slate-600 dark:text-slate-400 mt-10">
        {t("auth.login.noAccount")}{" "}
        <Link href="/register" className="font-semibold text-primary hover:text-secondary dark:hover:text-blue-400 transition-colors">
          {t("auth.login.registerLink")}
        </Link>
      </p>
    </main>
  );
}
