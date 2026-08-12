// app/(app)/checkout/success/page.tsx

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AppPaths } from "@/enums/AppPaths";
import { getOrderByCheckoutSessionId } from "@/lib/data/orders";
import { OrderCard } from "@/components/orders/OrderCard";

export default async function CheckoutSuccessPage(
    props: PageProps<"/checkout/success">
) {
    const { session_id } = await props.searchParams;

    if (!session_id || Array.isArray(session_id)) notFound();

    const entry = await getOrderByCheckoutSessionId(session_id);

    if (!entry) notFound();

    const isPaid = entry.status === "paid";

    return (
        <div className="mx-auto max-w-xl space-y-6 p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />

            <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                    {isPaid ? "Thanks for your order!" : "Order received"}
                </h1>
                <p className="text-muted-foreground">
                    {isPaid
                        ? `Order #${entry.id} is confirmed.`
                        : "We're still confirming your payment with Stripe — this will update shortly."}
                </p>
            </div>

            {/* `OrderCard` renders its own <li>, hence the wrapping list —
                it already covers the status, item count and total. */}
            <ul className="text-left">
                <OrderCard entry={entry} />
            </ul>

            <div className="flex items-center justify-center gap-2">
                {/* `nativeButton={false}`: the rendered element is an <a>, not a <button>. */}
                <Button nativeButton={false} render={<Link href={AppPaths.DASHBOARD} />}>
                    Continue shopping
                </Button>
                <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={AppPaths.ORDERS} />}
                >
                    View orders
                </Button>
            </div>
        </div>
    );
}
