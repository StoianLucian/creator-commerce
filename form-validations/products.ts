import { z } from "zod";

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
});

export type CreateProductInput = z.infer<typeof createProductSchema>;