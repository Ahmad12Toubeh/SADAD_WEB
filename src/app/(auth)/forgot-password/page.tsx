"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const res = await forgotPassword({ email });
      if (!res.resetToken) {
        setSuccess(t("auth.forgot.checkEmail"));
        return;
      }
      router.push(`/reset-password?token=${encodeURIComponent(res.resetToken)}`);
    } catch (err: any) {
      setError(err?.message ?? t("auth.forgot.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md mx-auto relative z-10">
      <div className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t("auth.forgot.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t("auth.forgot.subtitle")}</p>
      </div>

      <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-600"></div>
        <CardContent className="p-8">
          <form className="space-y-6" onSubmit={onSubmit}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm font-medium dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
                {success}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-slate-300">{t("auth.forgot.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.forgot.emailPlaceholder")}
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
                dir="ltr"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? t("auth.forgot.sending") : t("auth.forgot.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-slate-600 dark:text-slate-400 mt-8">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t("auth.forgot.backToLogin")}
        </Link>
      </p>
    </main>
  );
}
