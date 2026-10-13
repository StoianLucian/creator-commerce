// app/(app)/checkout/success/page.tsx

import { notFound } from "next/navigation";

import { getOrderByCheckoutSessionId } from "@/lib/data/orders";
import { OrderCard } from "@/components/orders/OrderCard";
import { CheckoutSuccessView } from "@/app/components/CheckoutSuccessView";

export default async function CheckoutSuccessPage(
    props: PageProps<"/checkout/success">
) {
    const { session_id } = await props.searchParams;

    if (!session_id || Array.isArray(session_id)) notFound();

    const entry = await getOrderByCheckoutSessionId(session_id);

    if (!entry) notFound();

    const isPaid = entry.status === "paid";

    // `OrderCard` renders its own <li>; the view wraps it in a list. It already
    // covers the status, item count and total.
    return (
        <CheckoutSuccessView isPaid={isPaid} orderId={entry.id}>
            <OrderCard entry={entry} />
        </CheckoutSuccessView>
    );
}
