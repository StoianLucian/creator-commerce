"use server";

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/src/db";
import { product } from "@/src/db/product-schema";
import { getWishlist, type WishlistFilters } from "@/lib/data/wishlist";
import { removeId, toggleId } from "@/lib/wishlist/wishlist";
import { readWishlist, writeWishlist } from "@/lib/wishlist/cookie";

const productIdSchema = z.coerce.number().int().positive();

export type WishlistActionResult = { success: boolean; error?: string };

export type ToggleWishlistResult = WishlistActionResult & {
    /** Whether the product is on the wishlist after the toggle. */
    wishlisted?: boolean;
};

/**
 * Toggles a product on the cookie wishlist.
 *
 * Like the cart, the wishlist is deliberately session-only: no account
 * required, so guests browsing Explore can save products before signing up.
 */
export async function toggleWishlist(input: {
    productId: number;
}): Promise<ToggleWishlistResult> {
    const parsed = productIdSchema.safeParse(input.productId);

    if (!parsed.success) {
        return { success: false, error: "Invalid product" };
    }

    const productId = parsed.data;

    try {
        // Confirm the product exists before it lands in the cookie, so the
        // wishlist can't accumulate ids that will never resolve.
        const found = await db.query.product.findFirst({
            where: and(eq(product.id, productId), isNull(product.deleted_at)),
            columns: { id: true },
        });

        if (!found) {
            return { success: false, error: "Product not found" };
        }

        const ids = await readWishlist();
        const next = toggleId(ids, productId);

        await writeWishlist(next);

        return { success: true, wishlisted: next.includes(productId) };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Could not update your wishlist" };
    }
}

export async function removeFromWishlist(input: {
    productId: number;
}): Promise<WishlistActionResult> {
    const parsed = productIdSchema.safeParse(input.productId);

    if (!parsed.success) {
        return { success: false, error: "Invalid product" };
    }

    try {
        const ids = await readWishlist();

        await writeWishlist(removeId(ids, parsed.data));
    } catch (error) {
        console.error(error);
        return { success: false, error: "Could not update your wishlist" };
    }

    return { success: true };
}

/**
 * Read side, exposed as actions so client components can fetch the wishlist
 * through react-query instead of prop-drilling it from a layout.
 */
export async function fetchWishlist(filters?: WishlistFilters) {
    return getWishlist(filters);
}

/** Just the saved ids — enough for the hearts to render their toggled state. */
export async function fetchWishlistIds() {
    return readWishlist();
}
