"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import i18n, { syncI18nToLocale } from "@/lib/i18n";
import { I18nextProvider } from "react-i18next";
import { setupClientMonitoring } from "@/lib/monitoring";
import type { AppLocale } from "@/lib/locale";
import { LOCALE_STORAGE_KEY, normalizeLocaleTag, persistLocalePreference } from "@/lib/locale";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Check local storage or system preference
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export function Providers({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: AppLocale;
}) {
  syncI18nToLocale(initialLocale);

  useEffect(() => {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw != null && raw !== "") {
      const saved = normalizeLocaleTag(raw);
      if (saved !== initialLocale) {
        void i18n.changeLanguage(saved);
        persistLocalePreference(saved);
      }
    }
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;

    const cleanupMonitoring = setupClientMonitoring();
    return cleanupMonitoring;
  }, [initialLocale]);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </I18nextProvider>
  );
}
