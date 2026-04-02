"use client";

import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { sendReminder } from "@/lib/api";

type ReminderTarget = {
  installmentId?: string;
  debtId?: string;
  customerName?: string | null;
  onSent?: () => void | Promise<void>;
  customerEmail?: string | null;
};

export function ReminderActions({ installmentId, debtId, customerName, customerEmail, onSent }: ReminderTarget) {
  const { t } = useTranslation();
  const [loadingChannel, setLoadingChannel] = useState<"whatsapp" | "email" | null>(null);

  const hasTarget = Boolean(installmentId || debtId);
  const hasEmail = Boolean(customerEmail);

  const handleSend = async (channel: "whatsapp" | "email") => {
    if (!hasTarget) return;
    setLoadingChannel(channel);
    try {
      const res = await sendReminder({ channel, installmentId, debtId });
      if (channel === "whatsapp") {
        if (res?.whatsappLink) {
          window.open(res.whatsappLink, "_blank", "noopener,noreferrer");
        }
      } else {
        alert(t("reminders.actions.emailSent"));
      }
      await onSent?.();
    } catch (err: unknown) {
      const apiErr = err as { message?: string; messageKey?: string } | undefined;
      const key = apiErr?.messageKey as string | undefined;
      const fallback =
        channel === "email"
          ? t("reminders.actions.emailFailed")
          : t("reminders.actions.whatsappFailed");
      alert(key ? t(key) : apiErr?.message ?? fallback);
    } finally {
      setLoadingChannel(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="gap-1.5 bg-[#25D366] hover:bg-[#20b558] text-white"
        onClick={() => handleSend("whatsapp")}
        disabled={!hasTarget || loadingChannel !== null}
        title={customerName ? `${t("reminders.actions.whatsapp")} - ${customerName}` : t("reminders.actions.whatsapp")}
      >
        <MessageCircle size={14} />
        {loadingChannel === "whatsapp" ? t("common.loading") : t("reminders.actions.whatsapp")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        onClick={() => handleSend("email")}
        disabled={!hasTarget || loadingChannel !== null || !hasEmail}
        title={
          !hasEmail
            ? t("errors.reminders.emailRequired")
            : customerName
            ? `${t("reminders.actions.email")} - ${customerName}`
            : t("reminders.actions.email")
        }
      >
        <Mail size={14} />
        {loadingChannel === "email" ? t("common.loading") : t("reminders.actions.email")}
      </Button>
    </div>
  );
}
