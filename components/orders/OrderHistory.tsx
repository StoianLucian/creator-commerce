import Link from "next/link";
import { Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { AppPaths } from "@/enums/AppPaths";
import { getMyOrders } from "@/lib/data/orders";
import { OrderList } from "./OrderList";

/**
 * The signed-in buyer's order list. Rendered inside `AuthGuard`, so there
 * is always a session by the time this runs.
 */
export async function OrderHistory() {
    const orders = await getMyOrders();

    if (orders.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Receipt />
                    </EmptyMedia>
                    <EmptyTitle>No orders yet</EmptyTitle>
                    <EmptyDescription>
                        Once you check out, your orders will show up here.
                    </EmptyDescription>
                </EmptyHeader>

                <Button
                    nativeButton={false}
                    render={<Link href={AppPaths.DASHBOARD} />}
                >
                    Browse products
                </Button>
            </Empty>
        );
    }

    return <OrderList orders={orders} />;
}
