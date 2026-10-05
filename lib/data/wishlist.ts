// lib/data/wishlist.ts

import "server-only";

import { and, eq, gte, ilike, inArray, isNull, lte, type SQL } from "drizzle-orm";

import { db } from "@/src/db";
import { product } from "@/src/db/product-schema";
import { readWishlist } from "@/lib/wishlist/cookie";
import { productOrderBy } from "@/lib/products/sort";
import type { ProductWithRelations } from "@/lib/actions/products";
import type { useProductsProps } from "@/hooks/useProducts";

/** The subset of catalog filters the wishlist supports (no status). */
export type WishlistFilters = Pick<
    useProductsProps,
    "q" | "sort" | "minPrice" | "maxPrice" | "categoryId"
>;

/**
 * Hydrates the cookie's product ids into full product rows, applying the same
 * search / price / category / sort filters the Explore page uses.
 *
 * Returns the same shape as `getProducts` so the wishlist page can reuse
 * `ProductCard`. The query is scoped to the cookie's ids, and deleted products
 * (and ids that no longer resolve) are dropped silently — a stale wishlist
 * shouldn't 500 the page.
 */
export async function getWishlist(
    filters: WishlistFilters = { q: "" }
): Promise<ProductWithRelations[]> {
    const ids = await readWishlist();

    if (!ids.length) return [];

    const { q = "", sort, minPrice, maxPrice, categoryId } = filters;

    const conditions: SQL[] = [
        inArray(product.id, ids),
        isNull(product.deleted_at),
        ilike(product.name, `%${q}%`),
    ];

    if (categoryId != null) {
        conditions.push(eq(product.categoryId, categoryId));
    }
    if (minPrice != null) {
        conditions.push(gte(product.price, minPrice));
    }
    if (maxPrice != null) {
        conditions.push(lte(product.price, maxPrice));
    }

    return db.query.product.findMany({
        where: and(...conditions),
        orderBy: productOrderBy(sort),
        with: {
            images: true,
            owner: { columns: { username: true } },
        },
    });
}
