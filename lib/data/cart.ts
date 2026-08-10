// lib/data/cart.ts

import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/src/db";
import { product } from "@/src/db/product-schema";
import { readCart } from "@/lib/cart/cookie";

export type CartItem = {
    productId: number;
    quantity: number;
    name: string;
    slug: string;
    /** Unit price, in whole dollars, as stored on the product. */
    price: number;
    lineTotal: number;
    imageUrl: string | null;
    /** Handle owner, used to link back to the product page. */
    ownerUsername: string | null;
};

export type Cart = {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
};

const EMPTY_CART: Cart = { items: [], itemCount: 0, subtotal: 0 };

/**
 * Hydrates the cookie's `{id, quantity}` pairs into full cart lines.
 *
 * Prices come from the database on every read, never from the cookie, and
 * ids that no longer exist are dropped silently — a deleted product
 * shouldn't 500 the cart.
 */
export async function getCart(): Promise<Cart> {
    const lines = await readCart();

    if (!lines.length) return EMPTY_CART;

    const rows = await db.query.product.findMany({
        where: inArray(
            product.id,
            lines.map((line) => line.productId)
        ),
        with: {
            images: { limit: 1 },
            owner: { columns: { username: true } },
        },
    });

    const byId = new Map(rows.map((row) => [row.id, row]));

    // Iterate the cookie, not the rows, so the cart keeps the order the
    // shopper added things in.
    const items = lines.flatMap<CartItem>((line) => {
        const row = byId.get(line.productId);

        if (!row) return [];

        return [
            {
                productId: row.id,
                quantity: line.quantity,
                name: row.name,
                slug: row.slug,
                price: row.price,
                lineTotal: row.price * line.quantity,
                imageUrl: row.images[0]?.imageUrl ?? null,
                ownerUsername: row.owner?.username ?? null,
            },
        ];
    });

    return {
        items,
        itemCount: items.reduce((total, item) => total + item.quantity, 0),
        subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
    };
}

/** Cheap count for the header badge — skips the join when the cart is empty. */
export async function getCartCount() {
    const lines = await readCart();

    return lines.reduce((total, line) => total + line.quantity, 0);
}
