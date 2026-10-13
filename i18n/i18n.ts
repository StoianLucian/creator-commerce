// i18n/i18n.ts
//
// Single i18next instance bound to react-i18next. Imported for its side effect
// so every `useTranslation()` call resolves against the same instance — the
// provider only switches its active language per the cookie-selected locale.

import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/messages/en.json";
import ro from "@/messages/ro.json";
import { DEFAULT_LOCALE, LOCALES } from "./config";

if (!i18next.isInitialized) {
    i18next.use(initReactI18next).init({
        resources: {
            en: { translation: en },
            ro: { translation: ro },
        },
        lng: DEFAULT_LOCALE,
        fallbackLng: DEFAULT_LOCALE,
        supportedLngs: LOCALES as unknown as string[],
        interpolation: {
            // React already escapes values, so i18next must not double-escape.
            escapeValue: false,
        },
        react: {
            // Resources are bundled, so there's nothing async to suspend on.
            useSuspense: false,
        },
    });
}

export default i18next;
