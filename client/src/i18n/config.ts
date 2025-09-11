import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import frTranslation from "./fr.json";
import enTranslation from "./eng.json";
import LanguageDetector from "i18next-browser-languagedetector";

export default i18next
	.use(LanguageDetector) // detects user language based on browser settings, and saves choices to localStorage
	.use(initReactI18next)
	.init({
		supportedLngs: ["en", "fr"],
		debug: true,
		resources: {
			fr: {
				translation: frTranslation,
			},
			en: {
				translation: enTranslation,
			},
		},
		fallbackLng: "fr",
		interpolation: {
			escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
		},
	});
