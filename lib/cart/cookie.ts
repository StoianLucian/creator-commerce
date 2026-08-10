// lib/cart/cookie.ts
//
// Server-only cookie access for the cart. Never import this from a client
// component — it pulls in `next/headers`.

import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import {
    CART_COOKIE,
    CART_COOKIE_MAX_AGE,
    MAX_CART_ITEMS,
    type CartLine,
    cartCookieSchema,
} from "./cart";

/**
 * Reads the cart out of the request cookies.
 *
 * Anything malformed is treated as an empty cart rather than an error — a
 * bad cookie shouldn't be able to break every page that shows a cart badge.
 *
 * Request-deduplicated so the layout badge and the cart sheet share one parse.
 */
export const readCart = cache(async (): Promise<CartLine[]> => {
    const raw = (await cookies()).get(CART_COOKIE)?.value;

    if (!raw) return [];

    try {
        const parsed = cartCookieSchema.safeParse(JSON.parse(raw));

        if (!parsed.success) return [];

        return parsed.data.map(({ i, q }) => ({ productId: i, quantity: q }));
    } catch {
        return [];
    }
});

/**
 * Writes the cart back to the cookie. Only callable from a Server Function or
 * Route Handler — Next.js can't set cookies while rendering.
 */
export async function writeCart(lines: CartLine[]) {
    const cookieStore = await cookies();

    if (!lines.length) {
        cookieStore.delete(CART_COOKIE);
        return;
    }

    const value = JSON.stringify(
        lines
            .slice(0, MAX_CART_ITEMS)
            .map(({ productId, quantity }) => ({ i: productId, q: quantity }))
    );

    cookieStore.set(CART_COOKIE, value, {
        // The cart is only ever read and mutated on the server, so keep it
        // out of reach of client-side scripts.
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: CART_COOKIE_MAX_AGE,
    });
}
