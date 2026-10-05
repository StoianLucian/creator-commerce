// lib/wishlist/wishlist.ts
//
// Pure wishlist shape and rules. Safe to import from client components — the
// cookie read/write lives in `./cookie`, which is server-only.
//
// The wishlist mirrors the cart (see lib/cart): a cookie-backed, guest-friendly
// list, but with no quantities — it's just the set of product ids the shopper
// has saved for later.

import { z } from "zod";

export const WISHLIST_COOKIE = "wishlist";

/** Cookies cap out at ~4KB; ids-only lets us keep a generous ceiling. */
export const MAX_WISHLIST_ITEMS = 100;

export const WISHLIST_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

/**
 * What actually lives in the cookie: product ids only. Names, prices and
 * images are always re-read from the database, so a hand-edited cookie can't
 * invent a product.
 */
export const wishlistCookieSchema = z.array(z.number().int().positive());

/** Appends an id if it's new and there's room; otherwise returns the list as-is. */
export function addId(ids: number[], productId: number): number[] {
    if (ids.includes(productId)) return ids;
    if (ids.length >= MAX_WISHLIST_ITEMS) return ids;

    return [...ids, productId];
}

export function removeId(ids: number[], productId: number): number[] {
    return ids.filter((id) => id !== productId);
}

/** Toggles membership: removes the id if present, adds it otherwise. */
export function toggleId(ids: number[], productId: number): number[] {
    return ids.includes(productId)
        ? removeId(ids, productId)
        : addId(ids, productId);
}
