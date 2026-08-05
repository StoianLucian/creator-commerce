"use server";
import { db } from "@/src/db";
import { product } from "@/src/db/product-schema";
import { productImages } from "@/src/db/product-images-schema";
import { eq, desc, and, like, ilike } from "drizzle-orm";

import { revalidatePath } from "next/cache";
import { CreateProductInput, createProductSchema } from "@/form-validations/products";
import slugify from "slugify";
import { redirect } from "next/navigation";
import { CreatorPaths } from "@/enums/AppPaths";
import { getSession } from "../session";

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

export type ProductWithRelations = Awaited<ReturnType<typeof getProducts>>[number];

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

/**
 * Loads one of the signed-in user's products with its category and images.
 * Returns null when the id doesn't exist or belongs to someone else, so the
 * caller can 404.
 */
export async function getProduct(id: number) {
    const session = await getSession();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (!Number.isInteger(id)) {
        return null;
    }

    const found = await db.query.product.findFirst({
        where: and(eq(product.id, id), eq(product.ownerId, session.user.id)),
        with: {
            category: true,
            images: true,
        },
    });

    return found ?? null;
}

export async function getProducts(q: string) {

    try {
        const session = await getSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }
        const products = await db.query.product.findMany({
            where: and(eq(product.ownerId, session.user.id), ilike(product.name, `%${q}%`)),
            orderBy: desc(product.created_at),
            with: {
                images: true,
            },
        });

        return products;
    } catch (error) {
        throw new Error("Error fetching products");
    }

}