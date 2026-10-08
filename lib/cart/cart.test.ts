import { describe, expect, it } from "vitest";

import {
    MAX_CART_ITEMS,
    MAX_ITEM_QUANTITY,
    addLine,
    cartCookieSchema,
    setLineQuantity,
    type CartLine,
} from "@/lib/cart/cart";

describe("addLine", () => {
    it("appends a new line for an unseen product", () => {
        expect(addLine([], 1, 2)).toEqual([{ productId: 1, quantity: 2 }]);
    });

    it("adds to the quantity of an existing line", () => {
        const lines: CartLine[] = [{ productId: 1, quantity: 2 }];
        expect(addLine(lines, 1, 3)).toEqual([{ productId: 1, quantity: 5 }]);
    });

    it("does not mutate the input array", () => {
        const lines: CartLine[] = [{ productId: 1, quantity: 2 }];
        addLine(lines, 1, 3);
        expect(lines).toEqual([{ productId: 1, quantity: 2 }]);
    });

    it("caps a merged line at MAX_ITEM_QUANTITY", () => {
        const lines: CartLine[] = [{ productId: 1, quantity: MAX_ITEM_QUANTITY - 1 }];
        expect(addLine(lines, 1, 10)).toEqual([
            { productId: 1, quantity: MAX_ITEM_QUANTITY },
        ]);
    });

    it("refuses to add a new product once the cart is full", () => {
        const full: CartLine[] = Array.from({ length: MAX_CART_ITEMS }, (_, i) => ({
            productId: i + 1,
            quantity: 1,
        }));
        expect(addLine(full, 999, 1)).toBe(full);
    });

    it("still tops up an existing line when the cart is full", () => {
        const full: CartLine[] = Array.from({ length: MAX_CART_ITEMS }, (_, i) => ({
            productId: i + 1,
            quantity: 1,
        }));
        const result = addLine(full, 1, 1);
        expect(result.find((l) => l.productId === 1)?.quantity).toBe(2);
    });
});

describe("setLineQuantity", () => {
    it("sets an absolute quantity", () => {
        const lines: CartLine[] = [{ productId: 1, quantity: 2 }];
        expect(setLineQuantity(lines, 1, 7)).toEqual([{ productId: 1, quantity: 7 }]);
    });

    it("drops the line when quantity is 0 or less", () => {
        const lines: CartLine[] = [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 },
        ];
        expect(setLineQuantity(lines, 1, 0)).toEqual([{ productId: 2, quantity: 1 }]);
        expect(setLineQuantity(lines, 1, -5)).toEqual([{ productId: 2, quantity: 1 }]);
    });

    it("caps the quantity at MAX_ITEM_QUANTITY", () => {
        const lines: CartLine[] = [{ productId: 1, quantity: 2 }];
        expect(setLineQuantity(lines, 1, 1000)).toEqual([
            { productId: 1, quantity: MAX_ITEM_QUANTITY },
        ]);
    });

    it("leaves other lines untouched for an unknown product", () => {
        const lines: CartLine[] = [{ productId: 1, quantity: 2 }];
        expect(setLineQuantity(lines, 999, 5)).toEqual(lines);
    });
});

describe("cartCookieSchema", () => {
    it("accepts well-formed id/quantity pairs", () => {
        expect(cartCookieSchema.safeParse([{ i: 1, q: 2 }]).success).toBe(true);
    });

    it("rejects non-positive ids and out-of-range quantities", () => {
        expect(cartCookieSchema.safeParse([{ i: 0, q: 1 }]).success).toBe(false);
        expect(cartCookieSchema.safeParse([{ i: 1, q: 0 }]).success).toBe(false);
        expect(
            cartCookieSchema.safeParse([{ i: 1, q: MAX_ITEM_QUANTITY + 1 }]).success,
        ).toBe(false);
    });

    it("rejects non-integers", () => {
        expect(cartCookieSchema.safeParse([{ i: 1.5, q: 1 }]).success).toBe(false);
    });
});
