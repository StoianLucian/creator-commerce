import "server-only";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local (see the Stripe dashboard's API keys page)."
    );
}

export const stripe = new Stripe(stripeKey, {
    typescript: true,
});

/**
 * Absolute origin for building Stripe redirect URLs (success/cancel), derived
 * from the incoming request so it matches whatever host the user is on
 * (localhost, staging, prod) — no env var needed.
 *
 * Must be called within a request scope (server action / route handler).
 */
export async function getBaseUrl() {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto =
        h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

    return `${proto}://${host}`;
}
