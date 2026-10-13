"use client";

import { useState } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "@/i18n/i18n";
import type { Locale } from "@/i18n/config";

/**
 * Activates the cookie-selected locale on the shared i18next instance. The
 * `locale` comes from the server (read from the cookie in the root layout),
 * so the server render and the client hydration use the same language and
 * don't mismatch. The language switcher calls `changeLanguage` afterwards.
 */
export function I18nProvider({
    locale,
    children,
}: {
    locale: Locale;
    children: React.ReactNode;
}) {
    // Runs once, during the first (server) render, before children render.
    useState(() => {
        if (i18n.language !== locale) {
            i18n.changeLanguage(locale);
        }
        return locale;
    });

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
