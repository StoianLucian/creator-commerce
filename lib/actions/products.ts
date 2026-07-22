"use server";
import { db } from "@/src/db";
import { product } from "@/src/db/product-schema";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../auth";
import { headers } from "next/headers";
import { CreateProductInput, createProductSchema } from "@/form-validations/products";
import slugify from "slugify";

export async function createProduct(data: CreateProductInput) {
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

    await db.insert(product).values({
        ...validated.data,
        ownerId: session.user.id,
        sold: 0,
        slug: slugify(validated.data.name),
    });

    revalidatePath("/products");

    return { success: true };
}