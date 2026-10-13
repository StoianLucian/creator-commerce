"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

/**
 * Centered spinner used as the route-level loading fallback (loading.tsx) and
 * anywhere a page is waiting on data. Fills its container's height.
 */
export function PageLoader({ className }: { className?: string }) {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                "flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 text-muted-foreground",
                className,
            )}
            role="status"
            aria-live="polite"
        >
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">{t("common.loading")}</p>
        </div>
    );
}
