import "server-only";
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local (see the Stripe dashboard's API keys page)."
    );
}

export const stripe = new Stripe(stripeKey, {
    typescript: true,
});

export function getBaseUrl() {
    return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}
