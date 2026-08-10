"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/src/db";
import { product } from "@/src/db/product-schema";
import { getCart } from "@/lib/data/cart";
import {
    MAX_CART_ITEMS,
    MAX_ITEM_QUANTITY,
    addLine,
    setLineQuantity,
} from "@/lib/cart/cart";
import { readCart, writeCart } from "@/lib/cart/cookie";

const productIdSchema = z.coerce.number().int().positive();

const addToCartSchema = z.object({
    productId: productIdSchema,
    quantity: z.coerce.number().int().min(1).max(MAX_ITEM_QUANTITY).default(1),
});

const updateQuantitySchema = z.object({
    productId: productIdSchema,
    // 0 removes the line.
    quantity: z.coerce.number().int().min(0).max(MAX_ITEM_QUANTITY),
});

export type CartActionResult = { success: boolean; error?: string };

/**
 * Adds a product to the cookie cart.
 *
 * The cart is deliberately session-only: no account required, so guests
 * browsing `/@handle/products/...` can shop before signing up.
 */
export async function addToCart(input: {
    productId: number;
    quantity?: number;
}): Promise<CartActionResult> {
    const parsed = addToCartSchema.safeParse(input);

    if (!parsed.success) {
        return { success: false, error: "Invalid product" };
    }

    const { productId, quantity } = parsed.data;

    try {
        // Confirm the product exists before it lands in the cookie, so the
        // cart can't accumulate ids that will never resolve.
        const found = await db.query.product.findFirst({
            where: eq(product.id, productId),
            columns: { id: true },
        });

        if (!found) {
            return { success: false, error: "Product not found" };
        }

        const lines = await readCart();

        const isNewLine = !lines.some((line) => line.productId === productId);

        if (isNewLine && lines.length >= MAX_CART_ITEMS) {
            return { success: false, error: "Your cart is full" };
        }

        await writeCart(addLine(lines, productId, quantity));
    } catch (error) {
        console.error(error);
        return { success: false, error: "Could not add to cart" };
    }

    return { success: true };
}

/** Sets an absolute quantity for one line; `0` removes it. */
export async function updateCartQuantity(input: {
    productId: number;
    quantity: number;
}): Promise<CartActionResult> {
    const parsed = updateQuantitySchema.safeParse(input);

    if (!parsed.success) {
        return { success: false, error: "Invalid quantity" };
    }

    const { productId, quantity } = parsed.data;

    try {
        const lines = await readCart();

        await writeCart(setLineQuantity(lines, productId, quantity));
    } catch (error) {
        console.error(error);
        return { success: false, error: "Could not update your cart" };
    }

    return { success: true };
}

export async function removeFromCart(input: {
    productId: number;
}): Promise<CartActionResult> {
    return updateCartQuantity({ productId: input.productId, quantity: 0 });
}

export async function clearCart(): Promise<CartActionResult> {
    try {
        await writeCart([]);
    } catch (error) {
        console.error(error);
        return { success: false, error: "Could not clear your cart" };
    }

    return { success: true };
}

/**
 * Read side, exposed as an action so client components can fetch the cart
 * through react-query instead of prop-drilling it from a layout.
 */
export async function fetchCart() {
    return getCart();
}
