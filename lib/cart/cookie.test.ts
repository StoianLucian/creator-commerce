import { describe, it, expect, vi, beforeEach } from "vitest";

import { CART_COOKIE } from "./cart";

// Neutralize the server-only import guard.
vi.mock("server-only", () => ({}));

// A single shared cookie store, swapped out per test.
const { cookieStore, cookiesMock } = vi.hoisted(() => {
    const cookieStore = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    };
    // cookies() is awaited in the source; returning the object works because
    // `await <non-promise>` resolves to the value itself.
    const cookiesMock = vi.fn(() => cookieStore);
    return { cookieStore, cookiesMock };
});

vi.mock("next/headers", () => ({ cookies: cookiesMock }));

import { readCart, writeCart } from "./cookie";

beforeEach(() => {
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
    cookieStore.delete.mockReset();
});

describe("readCart", () => {
    it("returns [] when there is no cookie", async () => {
        cookieStore.get.mockReturnValue(undefined);
        await expect(readCart()).resolves.toEqual([]);
    });

    it("parses a valid JSON cart cookie into CartLine[]", async () => {
        cookieStore.get.mockReturnValue({
            value: JSON.stringify([
                { i: 1, q: 2 },
                { i: 5, q: 1 },
            ]),
        });

        await expect(readCart()).resolves.toEqual([
            { productId: 1, quantity: 2 },
            { productId: 5, quantity: 1 },
        ]);
    });

    it("returns [] for malformed JSON", async () => {
        cookieStore.get.mockReturnValue({ value: "not-json{" });
        await expect(readCart()).resolves.toEqual([]);
    });

    it("returns [] for a cookie that fails the zod schema", async () => {
        // Valid JSON, wrong shape (missing q, non-positive id).
        cookieStore.get.mockReturnValue({
            value: JSON.stringify([{ i: -1 }, { foo: "bar" }]),
        });
        await expect(readCart()).resolves.toEqual([]);
    });
});

describe("writeCart", () => {
    it("deletes the cookie when given an empty cart", async () => {
        await writeCart([]);
        expect(cookieStore.delete).toHaveBeenCalledWith(CART_COOKIE);
        expect(cookieStore.set).not.toHaveBeenCalled();
    });

    it("sets the serialized {i,q} array with the documented options", async () => {
        await writeCart([
            { productId: 3, quantity: 4 },
            { productId: 7, quantity: 1 },
        ]);

        expect(cookieStore.delete).not.toHaveBeenCalled();
        expect(cookieStore.set).toHaveBeenCalledTimes(1);

        const [name, value, options] = cookieStore.set.mock.calls[0];
        expect(name).toBe(CART_COOKIE);
        expect(JSON.parse(value)).toEqual([
            { i: 3, q: 4 },
            { i: 7, q: 1 },
        ]);
        expect(options).toMatchObject({
            httpOnly: true,
            sameSite: "lax",
            path: "/",
        });
    });
});
