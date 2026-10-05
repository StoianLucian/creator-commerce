// lib/products/sort.ts
//
// Shared product ordering, used by both the catalog queries (lib/actions/
// products.ts) and the wishlist (lib/data/wishlist.ts). Kept out of the
// "use server" action file so it can be imported as a plain helper — a
// "use server" module may only export async functions.

import { asc, desc } from "drizzle-orm";

import { product } from "@/src/db/product-schema";
import type { ProductSort } from "@/hooks/useProducts";

export function productOrderBy(sort: ProductSort = "newest") {
    switch (sort) {
        case "price-asc":
            return asc(product.price);
        case "price-desc":
            return desc(product.price);
        case "most-sold":
            return desc(product.sold);
        default:
            return desc(product.created_at);
    }
}
