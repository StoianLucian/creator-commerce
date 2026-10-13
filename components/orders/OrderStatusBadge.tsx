"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/src/db/order-schema";

/** Status is a plain `text` column, so unknown values get a neutral badge. */
const STATUS_STYLES: Record<
    OrderStatus,
    { variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    paid: { variant: "default" },
    pending: { variant: "secondary" },
    failed: { variant: "destructive" },
    canceled: { variant: "outline" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const { t } = useTranslation();
    const style = STATUS_STYLES[status] ?? { variant: "outline" as const };

    // Known statuses have a translation; unknown values fall back to the raw text.
    const label = STATUS_STYLES[status] ? t(`orders.status.${status}`) : status;

    return <Badge variant={style.variant}>{label}</Badge>;
}
