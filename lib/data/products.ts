// lib/data/products.ts



import { db } from "@/src/db";
import { product } from "@/src/db/product-schema";

import { desc, eq } from "drizzle-orm";

export async function getProducts() {
    return db
        .select()
        .from(product)
        .orderBy(desc(product.created_at));
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