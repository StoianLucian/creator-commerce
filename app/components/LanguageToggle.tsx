"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
    DEFAULT_LOCALE,
    isLocale,
    LOCALE_COOKIE,
    LOCALE_LABELS,
    LOCALES,
} from "@/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Compact top-bar control: shows the active language code and, on click,
 * toggles to the other locale (there are exactly two). Persists the choice in
 * the cookie and refreshes so server components pick it up.
 */
export function LanguageToggle() {
    const { t, i18n } = useTranslation();
    const router = useRouter();

    const current = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;
    const next = LOCALES.find((locale) => locale !== current) ?? DEFAULT_LOCALE;

    const toggle = () => {
        i18n.changeLanguage(next);
        document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${ONE_YEAR};samesite=lax`;
        router.refresh();
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={toggle}
            aria-label={t("nav.language")}
            title={LOCALE_LABELS[next]}
        >
            <Languages className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">{current}</span>
        </Button>
    );
}
