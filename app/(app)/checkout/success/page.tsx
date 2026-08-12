// app/(app)/checkout/success/page.tsx

import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";

import { db } from "@/src/db";
import { order } from "@/src/db/order-schema";
import { Button } from "@/components/ui/button";
import { AppPaths } from "@/enums/AppPaths";
import { priceFormatter } from "@/lib/format";

export default async function CheckoutSuccessPage(
    props: PageProps<"/checkout/success">
) {
    const { session_id } = await props.searchParams;

    if (!session_id || Array.isArray(session_id)) notFound();


    const found = await db.query.order.findFirst({
        where: eq(order.stripeCheckoutSessionId, session_id),
        with: { items: true },
    });

    console.log(found)

    if (!found) {
        notFound();
    }

    const isPaid = found.status === "paid";

    return (
        <div className="mx-auto max-w-xl space-y-6 p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />

            <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                    {isPaid ? "Thanks for your order!" : "Order received"}
                </h1>
                <p className="text-muted-foreground">
                    {isPaid
                        ? `Order #${found.id} is confirmed.`
                        : "We're still confirming your payment with Stripe — this will update shortly."}
                </p>
            </div>

            <ul className="divide-y rounded-lg border text-left">
                {found.items.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between p-4"
                    >
                        <span>
                            {item.productName} × {item.quantity}
                        </span>
                        <span className="font-medium">
                            {priceFormatter.format(item.lineTotal / 100)}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="flex items-center justify-between px-1 text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">
                    {priceFormatter.format(found.subtotal / 100)}
                </span>
            </div>

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
