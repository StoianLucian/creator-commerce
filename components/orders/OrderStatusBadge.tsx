import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/src/db/order-schema";

/** Status is a plain `text` column, so unknown values get a neutral badge. */
const STATUS_STYLES: Record<
    OrderStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    paid: { label: "Paid", variant: "default" },
    pending: { label: "Pending", variant: "secondary" },
    failed: { label: "Failed", variant: "destructive" },
    canceled: { label: "Canceled", variant: "outline" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const style = STATUS_STYLES[status] ?? {
        label: status,
        variant: "outline" as const,
    };

    return <Badge variant={style.variant}>{style.label}</Badge>;
}
