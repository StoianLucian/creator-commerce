import { describe, it, expect, vi, beforeEach } from "vitest";

import { WISHLIST_COOKIE } from "./wishlist";

// Neutralize the server-only import guard.
vi.mock("server-only", () => ({}));

const { cookieStore, cookiesMock } = vi.hoisted(() => {
    const cookieStore = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    };
    const cookiesMock = vi.fn(() => cookieStore);
    return { cookieStore, cookiesMock };
});

vi.mock("next/headers", () => ({ cookies: cookiesMock }));

import { readWishlist, writeWishlist } from "./cookie";

beforeEach(() => {
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
    cookieStore.delete.mockReset();
});

describe("readWishlist", () => {
    it("returns [] when there is no cookie", async () => {
        cookieStore.get.mockReturnValue(undefined);
        await expect(readWishlist()).resolves.toEqual([]);
    });

    it("parses a valid JSON wishlist cookie into number[]", async () => {
        cookieStore.get.mockReturnValue({
            value: JSON.stringify([1, 5, 9]),
        });
        await expect(readWishlist()).resolves.toEqual([1, 5, 9]);
    });

    it("returns [] for malformed JSON", async () => {
        cookieStore.get.mockReturnValue({ value: "][broken" });
        await expect(readWishlist()).resolves.toEqual([]);
    });

    it("returns [] for a cookie that fails the zod schema", async () => {
        // Valid JSON, but not an array of positive ints.
        cookieStore.get.mockReturnValue({
            value: JSON.stringify([-1, "x", 0]),
        });
        await expect(readWishlist()).resolves.toEqual([]);
    });
});

describe("writeWishlist", () => {
    it("deletes the cookie when given an empty list", async () => {
        await writeWishlist([]);
        expect(cookieStore.delete).toHaveBeenCalledWith(WISHLIST_COOKIE);
        expect(cookieStore.set).not.toHaveBeenCalled();
    });

    it("sets the serialized ids array with the documented options", async () => {
        await writeWishlist([3, 7, 11]);

        expect(cookieStore.delete).not.toHaveBeenCalled();
        expect(cookieStore.set).toHaveBeenCalledTimes(1);

        const [name, value, options] = cookieStore.set.mock.calls[0];
        expect(name).toBe(WISHLIST_COOKIE);
        expect(JSON.parse(value)).toEqual([3, 7, 11]);
        expect(options).toMatchObject({
            httpOnly: true,
            sameSite: "lax",
            path: "/",
        });
    });
});
