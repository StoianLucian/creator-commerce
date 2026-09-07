// app/api/webhooks/stripe/route.ts

import { and, eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/src/db";
import { order, orderItem } from "@/src/db/order-schema";
import { product } from "@/src/db/product-schema";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation, sendSellerSaleNotification } from "@/lib/email";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe's source of truth for whether an order actually got paid.
 *
 * The success page (app/(app)/checkout/success) also checks the session
 * with Stripe directly for a fast confirmation, but this webhook is what
 * durably marks the order "paid" and bumps `product.sold` — it'll still
 * run even if the shopper closes the tab before the redirect completes.
 */
export async function POST(req: NextRequest) {
    if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET is not set");
        return NextResponse.json(
            { error: "Webhook not configured" },
            { status: 500 }
        );
    }

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
        console.error("Stripe webhook signature verification failed", error);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
        case "checkout.session.completed":
            await handleCheckoutCompleted(event.data.object);
            break;

        case "checkout.session.expired":
            await handleCheckoutExpired(event.data.object);
            break;

        default:
            // Ignore anything else — the webhook endpoint on the Stripe
            // dashboard only needs to list the events above, but Stripe
            // resends the event type on every attempt regardless.
            break;
    }

    return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = Number(session.metadata?.orderId);

    if (!Number.isInteger(orderId)) {
        console.error("checkout.session.completed with no orderId metadata", session.id);
        return;
    }

    // Idempotent: Stripe can and does redeliver webhooks, so only the first
    // delivery for a given order should flip status and bump `sold`.
    const [updated] = await db
        .update(order)
        .set({
            status: "paid",
            stripePaymentIntentId:
                typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id ?? null,
            buyerEmail: session.customer_details?.email ?? undefined,
        })
        .where(and(eq(order.id, orderId), eq(order.status, "pending")))
        .returning();

    if (!updated) return;

    const items = await db.query.orderItem.findMany({
        where: eq(orderItem.orderId, orderId),
    });

    for (const item of items) {
        if (item.productId === null) continue;

        await db
            .update(product)
            .set({ sold: sql`${product.sold} + ${item.quantity}` })
            .where(eq(product.id, item.productId));
    }

    // Fire-and-forget transactional email, kept after the paid/sold updates
    // above so an email hiccup can never undo the money-critical work.
    await sendOrderEmails(updated, items);
}

/**
 * Buyer receipt + one grouped notification per seller whose product sold.
 * Nothing here throws: the email helpers swallow their own errors, and the
 * seller lookup is wrapped defensively.
 */
async function sendOrderEmails(
    ord: typeof order.$inferSelect,
    items: (typeof orderItem.$inferSelect)[]
) {
    if (ord.buyerEmail) {
        await sendOrderConfirmation({
            to: ord.buyerEmail,
            orderId: ord.id,
            items,
            subtotal: ord.subtotal,
            currency: ord.currency,
        });
    }

    try {
        const productIds = items
            .map((item) => item.productId)
            .filter((id): id is number => id !== null);

        if (productIds.length === 0) return;

        const products = await db.query.product.findMany({
            where: inArray(product.id, productIds),
            with: {
                owner: { columns: { id: true, name: true, email: true } },
            },
        });

        const ownerByProduct = new Map(products.map((p) => [p.id, p.owner]));

        // Group the order's items by the seller who owns each product.
        const bySeller = new Map<
            string,
            { name: string; email: string; items: typeof items }
        >();

        for (const item of items) {
            if (item.productId === null) continue;
            const owner = ownerByProduct.get(item.productId);
            if (!owner) continue;

            const bucket =
                bySeller.get(owner.id) ??
                { name: owner.name, email: owner.email, items: [] };
            bucket.items.push(item);
            bySeller.set(owner.id, bucket);
        }

        for (const seller of bySeller.values()) {
            await sendSellerSaleNotification({
                to: seller.email,
                sellerName: seller.name,
                orderId: ord.id,
                items: seller.items,
                currency: ord.currency,
            });
        }
    } catch (error) {
        console.error("Failed to send seller notifications", error);
    }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
    const orderId = Number(session.metadata?.orderId);

    if (!Number.isInteger(orderId)) return;

    await db
        .update(order)
        .set({ status: "canceled" })
        .where(and(eq(order.id, orderId), eq(order.status, "pending")));
}
