export type AppLocale = "ar" | "en";

/** Same key i18next uses for localStorage */
export const LOCALE_STORAGE_KEY = "i18nextLng";

export function normalizeLocaleTag(raw: string | undefined | null): AppLocale {
  if (!raw) return "ar";
  const base = raw.split("-")[0]?.toLowerCase() ?? "";
  return base === "en" ? "en" : "ar";
}

/** Keep localStorage, cookie, and <html> in sync after the user picks a language */
export function persistLocalePreference(lang: AppLocale) {
  if (typeof document === "undefined") return;
  localStorage.setItem(LOCALE_STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.cookie = `${LOCALE_STORAGE_KEY}=${lang};path=/;max-age=31536000;SameSite=Lax`;
}
