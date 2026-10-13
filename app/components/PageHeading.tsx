"use client";

import { useTranslation } from "react-i18next";

/**
 * Translated page heading (title + subtitle) for the server-rendered pages,
 * which can't call `useTranslation` directly. Pass i18n keys.
 */
export function PageHeading({
    titleKey,
    subtitleKey,
}: {
    titleKey: string;
    subtitleKey: string;
}) {
    const { t } = useTranslation();

    return (
        <div>
            <h1 className="text-3xl font-bold">{t(titleKey)}</h1>
            <p className="text-muted-foreground">{t(subtitleKey)}</p>
        </div>
    );
}
