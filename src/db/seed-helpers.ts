import { and, eq, inArray } from "drizzle-orm";

import { db } from ".";
import { user } from "./auth-schema";
import { category } from "./category-schema";
import { product } from "./product-schema";
import { productImages } from "./product-images-schema";
import slugify from "slugify";

export type SeedProduct = {
    name: string;
    /** Whole lei — the app stores and displays whole-leu prices. */
    price: number;
    /** Must match a seeded category name (see src/db/seed.ts). */
    category: string;
    description: string;
    imageUrl: string;
};

/**
 * Inserts demo products under a creator, one image each. Idempotent: product
 * names the owner already has are skipped (the name column has no unique
 * constraint), so a script can be re-run without creating duplicates.
 *
 * Returns the number of products actually inserted.
 */
export async function seedProductsForOwner(
    ownerUsername: string,
    products: SeedProduct[],
): Promise<number> {
    const [owner] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.username, ownerUsername));

    if (!owner) {
        throw new Error(`No user with username "${ownerUsername}" to own the products`);
    }

    const categories = await db.select().from(category);
    const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

    const names = products.map((p) => p.name);
    const existing = await db
        .select({ name: product.name })
        .from(product)
        .where(and(eq(product.ownerId, owner.id), inArray(product.name, names)));
    const existingNames = new Set(existing.map((p) => p.name));

    let inserted = 0;

    for (const p of products) {
        if (existingNames.has(p.name)) {
            console.log(`skip (exists): ${p.name}`);
            continue;
        }

        const categoryId = categoryIdByName.get(p.category);
        if (categoryId == null) {
            console.warn(`skip (no category "${p.category}"): ${p.name}`);
            continue;
        }

        const [newProduct] = await db
            .insert(product)
            .values({
                name: p.name,
                description: p.description,
                ownerId: owner.id,
                categoryId,
                status: "active",
                slug: slugify(p.name, { lower: true, strict: true }),
                sold: 0,
                price: p.price,
            })
            .returning({ id: product.id });

        await db.insert(productImages).values({
            productId: newProduct.id,
            imageUrl: p.imageUrl,
            // External seed image — no uploadthing key to delete later.
            imageKey: `emag-seed-${newProduct.id}`,
        });

        inserted += 1;
        console.log(`added [${p.category}]: ${p.name} (${p.price} lei)`);
    }

    return inserted;
}
