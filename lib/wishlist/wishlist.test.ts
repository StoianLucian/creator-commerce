import { describe, expect, it } from "vitest";

import {
    MAX_WISHLIST_ITEMS,
    addId,
    removeId,
    toggleId,
    wishlistCookieSchema,
} from "@/lib/wishlist/wishlist";

describe("addId", () => {
    it("appends a new id", () => {
        expect(addId([1, 2], 3)).toEqual([1, 2, 3]);
    });

    it("is a no-op for an id already present", () => {
        const ids = [1, 2];
        expect(addId(ids, 2)).toBe(ids);
    });

    it("does not mutate the input", () => {
        const ids = [1, 2];
        addId(ids, 3);
        expect(ids).toEqual([1, 2]);
    });

    it("refuses to grow past MAX_WISHLIST_ITEMS", () => {
        const full = Array.from({ length: MAX_WISHLIST_ITEMS }, (_, i) => i + 1);
        expect(addId(full, 9999)).toBe(full);
    });
});

describe("removeId", () => {
    it("removes the id when present", () => {
        expect(removeId([1, 2, 3], 2)).toEqual([1, 3]);
    });

    it("returns an equivalent list when the id is absent", () => {
        expect(removeId([1, 2, 3], 99)).toEqual([1, 2, 3]);
    });
});

describe("toggleId", () => {
    it("adds the id when absent", () => {
        expect(toggleId([1, 2], 3)).toEqual([1, 2, 3]);
    });

    it("removes the id when present", () => {
        expect(toggleId([1, 2, 3], 2)).toEqual([1, 3]);
    });
});

describe("wishlistCookieSchema", () => {
    it("accepts an array of positive integer ids", () => {
        expect(wishlistCookieSchema.safeParse([1, 2, 3]).success).toBe(true);
        expect(wishlistCookieSchema.safeParse([]).success).toBe(true);
    });

    it("rejects non-positive and non-integer ids", () => {
        expect(wishlistCookieSchema.safeParse([0]).success).toBe(false);
        expect(wishlistCookieSchema.safeParse([-1]).success).toBe(false);
        expect(wishlistCookieSchema.safeParse([1.2]).success).toBe(false);
    });
});
