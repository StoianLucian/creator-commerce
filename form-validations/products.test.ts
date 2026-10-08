import { describe, expect, it } from "vitest";

import {
    MAX_PRODUCT_IMAGES,
    createProductSchema,
    productImageSchema,
} from "@/form-validations/products";

const image = { url: "https://example.com/a.png", key: "abc" };

const base = {
    name: "Nice Product",
    description: "A description",
    categoryId: 1,
    status: "active" as const,
    price: 100,
    images: [image],
};

describe("productImageSchema", () => {
    it("accepts a valid url + key", () => {
        expect(productImageSchema.safeParse(image).success).toBe(true);
    });

    it("rejects an invalid url", () => {
        expect(productImageSchema.safeParse({ url: "nope", key: "abc" }).success).toBe(
            false,
        );
    });

    it("rejects an empty key", () => {
        expect(
            productImageSchema.safeParse({ url: "https://x.com/a.png", key: "" }).success,
        ).toBe(false);
    });
});

describe("createProductSchema", () => {
    it("accepts a well-formed product", () => {
        expect(createProductSchema.safeParse(base).success).toBe(true);
    });

    it("trims and enforces the minimum name length", () => {
        expect(createProductSchema.safeParse({ ...base, name: "ab" }).success).toBe(false);
        // "  ab  " trims to "ab", still too short.
        expect(createProductSchema.safeParse({ ...base, name: "  ab  " }).success).toBe(
            false,
        );
    });

    it("allows an empty-string description", () => {
        expect(createProductSchema.safeParse({ ...base, description: "" }).success).toBe(
            true,
        );
    });

    it("requires a positive integer price", () => {
        expect(createProductSchema.safeParse({ ...base, price: 0 }).success).toBe(false);
        expect(createProductSchema.safeParse({ ...base, price: -5 }).success).toBe(false);
        expect(createProductSchema.safeParse({ ...base, price: 9.99 }).success).toBe(false);
    });

    it("requires a positive category id", () => {
        expect(createProductSchema.safeParse({ ...base, categoryId: 0 }).success).toBe(
            false,
        );
    });

    it("only accepts the known statuses", () => {
        expect(createProductSchema.safeParse({ ...base, status: "archived" }).success).toBe(
            false,
        );
    });

    it("requires at least one image", () => {
        expect(createProductSchema.safeParse({ ...base, images: [] }).success).toBe(false);
    });

    it("rejects more than MAX_PRODUCT_IMAGES images", () => {
        const tooMany = Array.from({ length: MAX_PRODUCT_IMAGES + 1 }, (_, i) => ({
            url: `https://example.com/${i}.png`,
            key: `k${i}`,
        }));
        expect(createProductSchema.safeParse({ ...base, images: tooMany }).success).toBe(
            false,
        );
    });
});
