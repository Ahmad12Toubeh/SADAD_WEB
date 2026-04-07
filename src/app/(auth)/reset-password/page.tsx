"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { resetPassword } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/^\d{4}$/.test(code)) {
      setError(i18n.language.startsWith("ar") ? "أدخل رمز مكوّن من 4 أرقام." : "Enter a 4-digit code.");
      return;
    }
    if (newPassword.length < 8) {
      setError(t("auth.reset.passwordMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.reset.passwordMismatch"));
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ code, newPassword });
      setSuccess(t("auth.reset.success"));
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      setError(err?.message ?? t("auth.reset.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md mx-auto relative z-10">
      <div className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t("auth.reset.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {i18n.language.startsWith("ar")
            ? "أدخل رمز التحقق الذي وصل إلى بريدك الإلكتروني ثم كلمة المرور الجديدة."
            : "Enter the 4-digit code from your email and set a new password."}
        </p>
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
              <Label htmlFor="code" className="dark:text-slate-300">
                {i18n.language.startsWith("ar") ? "رمز التحقق" : "Verification code"}
              </Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="dark:text-slate-300">{t("auth.reset.newPasswordLabel")}</Label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="********"
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="dark:text-slate-300">{t("auth.reset.confirmPasswordLabel")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                className="h-11 dark:bg-slate-950 dark:border-slate-800 text-start"
                dir="ltr"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? t("auth.reset.saving") : t("auth.reset.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-slate-600 dark:text-slate-400 mt-8">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t("auth.reset.backToLogin")}
        </Link>
      </p>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="w-full max-w-md mx-auto relative z-10" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
