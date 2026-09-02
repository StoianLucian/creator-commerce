"use server";
import { db } from "@/src/db";
import { product } from "@/src/db/product-schema";
import { productImages } from "@/src/db/product-images-schema";
import { user } from "@/src/db/auth-schema";
import { eq, asc, desc, and, ilike, inArray, gte, lte } from "drizzle-orm";

import { revalidatePath } from "next/cache";
import { CreateProductInput, createProductSchema } from "@/form-validations/products";
import slugify from "slugify";
import { redirect } from "next/navigation";
import { CreatorPaths } from "@/enums/AppPaths";
import { getSession } from "../session";
import { useProductsProps, ProductSort } from "@/hooks/useProducts";

function productOrderBy(sort: ProductSort = "newest") {
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

export async function createProduct(data: CreateProductInput) {

    let productsPath: string;

    try {
        const session = await getSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const validated = createProductSchema.safeParse(data);

        if (!validated.success) {
            return {
                success: false,
                errors: validated.error.flatten().fieldErrors,
            };
        }
        const { images, ...productData } = validated.data;

        const [newProduct] = await db
            .insert(product)
            .values({
                ...productData,
                ownerId: session.user.id,
                sold: 0,
                slug: slugify(validated.data.name),
            })
            .returning();

        const productId = newProduct.id;

        await db.insert(productImages).values(
            images.map((image) => ({
                productId,
                imageUrl: image.url,
                imageKey: image.key,
            }))
        );

        productsPath = CreatorPaths.products(session.user.username!);
        revalidatePath(productsPath);
    } catch (error) {
        console.error(error);
        return { success: false, errors: { formErrors: ["Something went wrong"] } };
    }

    // redirect throws, so it has to sit outside the try block.
    redirect(productsPath);
}

export async function updateProduct(id: number, data: CreateProductInput) {

    let productsPath: string;

    try {
        const session = await getSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const validated = createProductSchema.safeParse(data);

        if (!validated.success) {
            return {
                success: false,
                errors: validated.error.flatten().fieldErrors,
            };
        }

        const { images, ...productData } = validated.data;

        const [updated] = await db
            .update(product)
            .set({
                ...productData,
                slug: slugify(validated.data.name),
            })
            .where(and(eq(product.id, id), eq(product.ownerId, session.user.id)))
            .returning();

        if (!updated) {
            return { success: false, errors: { formErrors: ["Product not found"] } };
        }

        await db.delete(productImages).where(eq(productImages.productId, id));
        await db.insert(productImages).values(
            images.map((image) => ({
                productId: id,
                imageUrl: image.url,
                imageKey: image.key,
            }))
        );

        productsPath = CreatorPaths.products(session.user.username!);
        revalidatePath(productsPath);
    } catch (error) {
        console.error(error);
        return { success: false, errors: { formErrors: ["Something went wrong"] } };
    }

    redirect(productsPath);
}

export type ProductWithRelations = Awaited<ReturnType<typeof getProducts>>[number];

export type ProductDetail = NonNullable<
    Awaited<ReturnType<typeof getProductByHandle>>
>;

/**
 * Loads a product by id, scoped to the creator whose `@handle` is in the URL.
 *
 * Public: no session required, so guests following a link from Explore can
 * read `/@lucians/products/9/product-2`. Returns null when the id doesn't
 * exist or isn't that creator's, so the caller can 404 — this is what stops
 * `/@someone-else/products/9/...` from resolving another creator's product.
 */
export async function getProductByHandle(username: string, id: number) {
    if (!Number.isInteger(id)) {
        return null;
    }

    const found = await db.query.product.findFirst({
        where: and(
            eq(product.id, id),
            // Match on the owner's username rather than an id, so the handle
            // in the URL is what authorizes the read.
            inArray(
                product.ownerId,
                db
                    .select({ id: user.id })
                    .from(user)
                    .where(eq(user.username, username))
            )
        ),
        with: {
            category: true,
            images: true,
            owner: {
                columns: { username: true },
            },
        },
    });

    return found ?? null;
}

export async function getProducts({ q, sort, minPrice, maxPrice }: useProductsProps) {

    try {
        const conditions = [
            eq(product.status, "active"),
            ilike(product.name, `%${q}%`),
        ];

        if (minPrice != null) {
            conditions.push(gte(product.price, minPrice));
        }
        if (maxPrice != null) {
            conditions.push(lte(product.price, maxPrice));
        }

        const products = await db.query.product.findMany({
            where: and(...conditions),
            orderBy: productOrderBy(sort),
            with: {
                images: true,

                owner: {
                    columns: { username: true },
                },
            },
        });

        return products;
    } catch {
        throw new Error("Error fetching products");
    }

}

export async function getOwnnProducts({ q, sort, minPrice, maxPrice }: useProductsProps) {

    try {
        const session = await getSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const conditions = [
            eq(product.ownerId, session.user.id),
            ilike(product.name, `%${q}%`),
        ];

        if (minPrice != null) {
            conditions.push(gte(product.price, minPrice));
        }
        if (maxPrice != null) {
            conditions.push(lte(product.price, maxPrice));
        }

        const products = await db.query.product.findMany({
            where: and(...conditions),
            orderBy: productOrderBy(sort),
            with: {
                images: true,

                owner: {
                    columns: { username: true },
                },
            },
        });

        return products;
    } catch {
        throw new Error("Error fetching products");
    }

}