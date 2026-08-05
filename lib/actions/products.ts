"use server";
import { db } from "@/src/db";
import { Product, product } from "@/src/db/product-schema";
import { eq, desc } from "drizzle-orm";

import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { headers } from "next/headers";
import { CreateProductInput, createProductSchema } from "@/form-validations/products";
import slugify from "slugify";
import { redirect } from "next/navigation";
import { AppPaths } from "@/enums/AppPaths";

export async function createProduct(data: CreateProductInput) {

    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

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
        const [newProduct] = await db
            .insert(product)
            .values({
                ...validated.data,
                ownerId: session.user.id,
                sold: 0,
                slug: slugify(validated.data.name),
            })
            .returning();

        revalidatePath("/products");
        redirect(AppPaths.PRODUCTS)


        // return { success: true, id: newProduct.id };
    } catch (error) {
        console.error(error);
        return { success: false, errors: { formErrors: ["Something went wrong"] } };
    }

}

export async function getProducts(): Promise<Product[]> {

    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }
        const products = await db
            .select()
            .from(product)
            .where(eq(product.ownerId, session.user.id))
            .orderBy(desc(product.created_at));


        return products;
    } catch (error) {
        throw new Error("Error fetching products");
    }

}