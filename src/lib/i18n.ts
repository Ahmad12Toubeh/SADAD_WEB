import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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

export default i18n;
