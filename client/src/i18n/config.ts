import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import frTranslation from "./fr.json";

export default i18next.use(initReactI18next).init({
  lng: "fr",
  debug: true,
  resources: {
    fr: {
      translation: frTranslation,
    },
  },
  fallbackLng: "fr",

  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
});
