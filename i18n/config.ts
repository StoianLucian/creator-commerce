// i18n/config.ts
//
// Plain (non-"use server") module for locale constants, so it can be imported
// from both server actions and client components.

export const LOCALES = ["en", "ro"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie the chosen locale is persisted in (no locale prefix in the URL). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Human labels for the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
    en: "English",
    ro: "Română",
};

export function isLocale(value: string | undefined | null): value is Locale {
    return !!value && (LOCALES as readonly string[]).includes(value);
}
