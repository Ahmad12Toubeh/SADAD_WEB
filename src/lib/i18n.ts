import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { AppLocale } from './locale';

import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

const resources = {
  ar: { translation: arTranslations },
  en: { translation: enTranslations }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

/** Align the singleton with SSR / cookie so the first client render matches the server HTML */
export function syncI18nToLocale(locale: AppLocale) {
  const current = i18n.language.split("-")[0];
  if (current === locale) return;
  void i18n.changeLanguage(locale);
}

export default i18n;
