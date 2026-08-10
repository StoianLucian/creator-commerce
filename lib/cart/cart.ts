// lib/cart/cart.ts
//
// Pure cart shape and rules. Safe to import from client components — the
// cookie read/write lives in `./cookie`, which is server-only.

import { z } from "zod";

export const CART_COOKIE = "cart";

/** Cookies cap out at ~4KB, so keep the cart small and the keys short. */
export const MAX_CART_ITEMS = 50;
export const MAX_ITEM_QUANTITY = 99;

export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * What actually lives in the cookie: ids and quantities only.
 *
 * Names, prices and images are always re-read from the database, so a
 * hand-edited cookie can't invent a product or change what it costs.
 */
export const cartCookieSchema = z.array(
    z.object({
        i: z.number().int().positive(),
        q: z.number().int().min(1).max(MAX_ITEM_QUANTITY),
    })
);

export type CartLine = { productId: number; quantity: number };

/** Adds to an existing line's quantity, or appends a new line. */
export function addLine(
    lines: CartLine[],
    productId: number,
    quantity: number
): CartLine[] {
    const existing = lines.find((line) => line.productId === productId);

    if (existing) {
        return lines.map((line) =>
            line.productId === productId
                ? {
                    ...line,
                    quantity: Math.min(
                        line.quantity + quantity,
                        MAX_ITEM_QUANTITY
                    ),
                }
                : line
        );
    }

    if (lines.length >= MAX_CART_ITEMS) {
        return lines;
    }

    return [...lines, { productId, quantity }];
}

/** Sets an absolute quantity; a quantity of 0 drops the line. */
export function setLineQuantity(
    lines: CartLine[],
    productId: number,
    quantity: number
): CartLine[] {
    if (quantity <= 0) {
        return lines.filter((line) => line.productId !== productId);
    }

    return lines.map((line) =>
        line.productId === productId
            ? { ...line, quantity: Math.min(quantity, MAX_ITEM_QUANTITY) }
            : line
    );
}
