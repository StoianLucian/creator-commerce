"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { AppPaths } from "@/enums/AppPaths";

/** Empty state for a buyer with no orders yet. Client-side for translations. */
export function OrdersEmpty() {
    const { t } = useTranslation();

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Receipt />
                </EmptyMedia>
                <EmptyTitle>{t("orders.emptyTitle")}</EmptyTitle>
                <EmptyDescription>{t("orders.emptyDesc")}</EmptyDescription>
            </EmptyHeader>

            <Button nativeButton={false} render={<Link href={AppPaths.DASHBOARD} />}>
                {t("orders.browse")}
            </Button>
        </Empty>
    );
}
