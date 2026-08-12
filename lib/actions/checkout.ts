"use server";

import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import { order, orderItem } from "@/src/db/order-schema";
import { getCart } from "@/lib/data/cart";
import { getSession } from "@/lib/session";
import { getBaseUrl, stripe } from "@/lib/stripe";

export type CheckoutResult =
    | { success: true; url: string }
    | { success: false; error: string };

/**
 * Creates a pending `orders` row from the current cart, then a Stripe
 * Checkout Session pointed at it.
 *
 * The order is created first (status "pending") so its id can travel in
 * the session's metadata — that's what the webhook uses to find the right
 * order once Stripe confirms payment. If Stripe never gets the session
 * created, the pending order is deleted so it doesn't linger.
 */
export async function createCheckoutSession(): Promise<CheckoutResult> {
    const cart = await getCart();

    if (cart.items.length === 0) {
        return { success: false, error: "Your cart is empty" };
    }

    const session = await getSession();

    let orderId: number;

    try {
        const [newOrder] = await db
            .insert(order)
            .values({
                buyerId: session?.user?.id ?? null,
                buyerEmail: session?.user?.email ?? null,
                status: "pending",
                // Stripe expects cents; the cart's subtotal is whole dollars.
                subtotal: cart.subtotal * 100,
                currency: "usd",
                // Placeholder — replaced below once the Checkout Session
                // exists. The column is NOT NULL + unique, so it needs a
                // value up front; the real id can't collide with it.
                stripeCheckoutSessionId: `pending_${crypto.randomUUID()}`,
            })
            .returning();

        orderId = newOrder.id;

        await db.insert(orderItem).values(
            cart.items.map((item) => ({
                orderId,
                productId: item.productId,
                productName: item.name,
                unitPrice: item.price * 100,
                quantity: item.quantity,
                lineTotal: item.lineTotal * 100,
            }))
        );
    } catch (error) {
        console.error(error);
        return { success: false, error: "Could not start checkout" };
    }

    try {
        const baseUrl = getBaseUrl();

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: cart.items.map((item) => ({
                quantity: item.quantity,
                price_data: {
                    currency: "usd",
                    unit_amount: item.price * 100,
                    product_data: {
                        name: item.name,
                        images: item.imageUrl ? [item.imageUrl] : undefined,
                    },
                },
            })),
            customer_email: session?.user?.email ?? undefined,
            metadata: { orderId: String(orderId) },
            success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/checkout/cancel`,
        });

        if (!checkoutSession.url) {
            throw new Error("Stripe did not return a Checkout URL");
        }

        await db
            .update(order)
            .set({ stripeCheckoutSessionId: checkoutSession.id })
            .where(eq(order.id, orderId));

        return { success: true, url: checkoutSession.url };
    } catch (error) {
        console.error(error);

        // Best-effort cleanup: don't leave a pending order with no Stripe
        // session behind it.
        try {
            await db.delete(order).where(eq(order.id, orderId));
        } catch (cleanupError) {
            console.error(cleanupError);
        }

        return { success: false, error: "Could not start checkout" };
    }
}
