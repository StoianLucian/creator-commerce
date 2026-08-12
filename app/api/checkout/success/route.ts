// app/api/checkout/success/route.ts
//
// Stripe redirects the shopper's browser here after a successful Checkout.
// This is a Route Handler (not the page component) specifically so it's
// allowed to clear the cart cookie — Next.js only permits cookie writes
// from Server Actions and Route Handlers, not while rendering a page.

import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/src/db";
import { order } from "@/src/db/order-schema";
import { clearCart } from "@/lib/actions/cart";
import { getBaseUrl, stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
    const baseUrl = getBaseUrl();
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.redirect(`${baseUrl}/checkout/cancel`);
    }

    const found = await db.query.order.findFirst({
        where: eq(order.stripeCheckoutSessionId, sessionId),
    });

    if (!found) {
        return NextResponse.redirect(`${baseUrl}/checkout/cancel`);
    }

    // The webhook is what durably marks the order "paid" and is the only
    // thing that should be trusted for fulfillment — but it may not have
    // landed yet by the time this redirect lands, so ask Stripe directly
    // just to decide whether it's safe to clear the shopper's cart now.
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status === "paid") {
        await clearCart();
    }

    return NextResponse.redirect(`${baseUrl}/checkout/success?order=${found.id}`);
}
