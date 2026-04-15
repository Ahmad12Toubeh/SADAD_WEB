"use client";

import { useEffect } from "react";
import { LOCALE_STORAGE_KEY } from "@/lib/locale";

type LocaleSyncProps = {
  initialLocale: "ar" | "en";
};

export function LocaleSync({ initialLocale }: LocaleSyncProps) {
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) || initialLocale;
      const lang = stored.startsWith("en") ? "en" : "ar";
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
      document.cookie = `${LOCALE_STORAGE_KEY}=${lang};path=/;max-age=31536000;SameSite=Lax`;
    } catch {
      // Ignore storage failures and keep the server-provided locale.
    }
  }, [initialLocale]);

  return null;
}
