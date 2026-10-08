import { describe, it, expect } from "vitest";
import { asc, desc } from "drizzle-orm";

import { productOrderBy } from "./sort";
import { product } from "@/src/db/product-schema";

describe("productOrderBy", () => {
    it("maps price-asc to asc(product.price)", () => {
        expect(productOrderBy("price-asc")).toStrictEqual(asc(product.price));
    });

    it("maps price-desc to desc(product.price)", () => {
        expect(productOrderBy("price-desc")).toStrictEqual(desc(product.price));
    });

    it("maps most-sold to desc(product.sold)", () => {
        expect(productOrderBy("most-sold")).toStrictEqual(desc(product.sold));
    });

    it("defaults to desc(product.created_at)", () => {
        expect(productOrderBy()).toStrictEqual(desc(product.created_at));
    });

    it("treats 'newest' the same as the default", () => {
        expect(productOrderBy("newest")).toStrictEqual(productOrderBy());
    });

    it("produces distinct orderings for the four branches", () => {
        const priceAsc = productOrderBy("price-asc");
        const priceDesc = productOrderBy("price-desc");
        const mostSold = productOrderBy("most-sold");
        const newest = productOrderBy("newest");

        expect(priceAsc).not.toStrictEqual(priceDesc);
        expect(priceAsc).not.toStrictEqual(mostSold);
        expect(priceAsc).not.toStrictEqual(newest);
        expect(priceDesc).not.toStrictEqual(mostSold);
        expect(priceDesc).not.toStrictEqual(newest);
        expect(mostSold).not.toStrictEqual(newest);
    });
});
