import { z } from "zod";

/** Upper bound on how many images a single product can carry. */
export const MAX_PRODUCT_IMAGES = 6;

export const productImageSchema = z.object({
    url: z.url("Invalid image URL"),
    key: z.string().min(1),
});

export type ProductImage = z.infer<typeof productImageSchema>;

export const createProductSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name is too long"),

    description: z
        .string()
        .trim()
        .max(1000, "Description is too long")
        .optional()
        .or(z.literal("")),

    categoryId: z
        .number()
        .int()
        .positive("Please select a category"),

    status: z.enum(["draft", "active", "sold"]),

    price: z
        .number()
        .int()
        .positive("Price must be greater than 0"),

    images: z
        .array(productImageSchema)
        .min(1, "Please upload at least one image")
        .max(MAX_PRODUCT_IMAGES, `You can upload at most ${MAX_PRODUCT_IMAGES} images`),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;