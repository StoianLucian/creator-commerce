// lib/data/products.ts

import "server-only";

import { db } from "@/src/db";
import { product } from "@/src/db/product-schema";

import { and, desc, eq, isNull } from "drizzle-orm";

export async function getProducts() {
    return db
        .select()
        .from(product)
        .orderBy(desc(product.created_at));
}

/**
 * Products a shopper can actually buy right now — active, not soft-deleted —
 * most-sold first, with their category name. Used by the assistant to suggest
 * things to buy from the whole store (not just the current creator's own).
 */
export async function getStoreProducts(limit = 50) {
    return db.query.product.findMany({
        where: and(eq(product.status, "active"), isNull(product.deleted_at)),
        orderBy: desc(product.sold),
        limit,
        columns: { id: true, name: true, slug: true, price: true, sold: true, description: true },
        with: {
            category: { columns: { name: true } },
            owner: { columns: { username: true } },
            images: { limit: 1, columns: { imageUrl: true } },
        },
    });
}

export async function getProductsByOwner(ownerId: string) {
    return db
        .select()
        .from(product)
        .where(eq(product.ownerId, ownerId))
        .orderBy(desc(product.created_at));
}

export async function getProductById(id: number) {
    return db.query.product.findFirst({
        where: (product, { eq }) => eq(product.id, id),
    })
};