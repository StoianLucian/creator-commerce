import { getMyOrders } from "@/lib/data/orders";
import { OrderList } from "./OrderList";
import { OrdersEmpty } from "./OrdersEmpty";

/**
 * The signed-in buyer's order list. Rendered inside `AuthGuard`, so there
 * is always a session by the time this runs.
 */
export async function OrderHistory() {
    const orders = await getMyOrders();

    if (orders.length === 0) {
        return <OrdersEmpty />;
    }

    return <OrderList orders={orders} />;
}
