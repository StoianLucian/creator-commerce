"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DEFAULT_LOCALE,
    isLocale,
    LOCALE_COOKIE,
    LOCALE_LABELS,
    LOCALES,
} from "@/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Switches the active language and persists the choice in a cookie, then
 * refreshes so server components (and `<html lang>`) pick up the new locale.
 */
export function LanguageSwitcher() {
    const { t, i18n } = useTranslation();
    const router = useRouter();

    const current = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;

    const items = LOCALES.map((locale) => ({
        value: locale,
        label: LOCALE_LABELS[locale],
    }));

    const change = (value: string | null) => {
        if (!isLocale(value) || value === current) return;
        i18n.changeLanguage(value);
        document.cookie = `${LOCALE_COOKIE}=${value};path=/;max-age=${ONE_YEAR};samesite=lax`;
        router.refresh();
    };

    return (
        <Select items={items} value={current} onValueChange={change}>
            <SelectTrigger
                className="data-[size=default]:h-9 w-full"
                aria-label={t("nav.language")}
            >
                <Languages className="h-4 w-4" />
                <SelectValue />
            </SelectTrigger>

            <SelectContent>
                {LOCALES.map((locale) => (
                    <SelectItem key={locale} value={locale}>
                        {LOCALE_LABELS[locale]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
