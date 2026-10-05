// lib/wishlist/cookie.ts
//
// Server-only cookie access for the wishlist. Never import this from a client
// component — it pulls in `next/headers`.

import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import {
    WISHLIST_COOKIE,
    WISHLIST_COOKIE_MAX_AGE,
    MAX_WISHLIST_ITEMS,
    wishlistCookieSchema,
} from "./wishlist";

/**
 * Reads the wishlist out of the request cookies.
 *
 * Anything malformed is treated as an empty wishlist rather than an error — a
 * bad cookie shouldn't be able to break every page that reads it.
 *
 * Request-deduplicated so the sidebar, the page and the hearts share one parse.
 */
export const readWishlist = cache(async (): Promise<number[]> => {
    const raw = (await cookies()).get(WISHLIST_COOKIE)?.value;

    if (!raw) return [];

    try {
        const parsed = wishlistCookieSchema.safeParse(JSON.parse(raw));

        if (!parsed.success) return [];

        return parsed.data;
    } catch {
        return [];
    }
});

/**
 * Writes the wishlist back to the cookie. Only callable from a Server Function
 * or Route Handler — Next.js can't set cookies while rendering.
 */
export async function writeWishlist(ids: number[]) {
    const cookieStore = await cookies();

    if (!ids.length) {
        cookieStore.delete(WISHLIST_COOKIE);
        return;
    }

    const value = JSON.stringify(ids.slice(0, MAX_WISHLIST_ITEMS));

    cookieStore.set(WISHLIST_COOKIE, value, {
        // Only ever read and mutated on the server, so keep it out of reach of
        // client-side scripts.
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: WISHLIST_COOKIE_MAX_AGE,
    });
}
