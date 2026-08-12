// app/api/webhooks/stripe/route.ts

import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/src/db";
import { order, orderItem } from "@/src/db/order-schema";
import { product } from "@/src/db/product-schema";
import { stripe } from "@/lib/stripe";

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
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
    const orderId = Number(session.metadata?.orderId);

    if (!Number.isInteger(orderId)) return;

    await db
        .update(order)
        .set({ status: "canceled" })
        .where(and(eq(order.id, orderId), eq(order.status, "pending")));
}
