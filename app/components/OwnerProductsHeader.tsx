"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { CreatorPaths } from "@/enums/AppPaths";

/** Translated header for the owner's products page: heading + "New Product". */
export function OwnerProductsHeader({ username }: { username: string }) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">{t("headings.productsTitle")}</h1>
                <p className="text-muted-foreground">
                    {t("headings.productsSubtitle")}
                </p>
            </div>

            <Link
                href={CreatorPaths.productsNew(username)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
                <Plus className="h-4 w-4" />
                {t("headings.newProduct")}
            </Link>
        </div>
    );
}
