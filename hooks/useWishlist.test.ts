import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchWishlist, fetchWishlistIds, toggleWishlist, removeFromWishlist } =
    vi.hoisted(() => ({
        fetchWishlist: vi.fn(),
        fetchWishlistIds: vi.fn(),
        toggleWishlist: vi.fn(),
        removeFromWishlist: vi.fn(),
    }));

vi.mock("@/lib/actions/wishlist", () => ({
    fetchWishlist,
    fetchWishlistIds,
    toggleWishlist,
    removeFromWishlist,
}));

import { useWishlist, useWishlistIds } from "@/hooks/useWishlist";

function createWrapper() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client }, children);
}

describe("useWishlist", () => {
    beforeEach(() => {
        fetchWishlist.mockReset();
        fetchWishlistIds.mockReset();
    });

    it("passes the filters to fetchWishlist and surfaces the data", async () => {
        const data = [{ id: 3, name: "Saved" }];
        fetchWishlist.mockResolvedValue(data);

        const filters = {
            q: "hat",
            sort: "newest" as const,
            minPrice: 5,
            maxPrice: 20,
            categoryId: 1,
        };

        const { result } = renderHook(() => useWishlist(filters), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(data);
        expect(fetchWishlist).toHaveBeenCalledWith(filters);
    });

    it("useWishlistIds surfaces the saved ids", async () => {
        fetchWishlistIds.mockResolvedValue([1, 2, 3]);

        const { result } = renderHook(() => useWishlistIds(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual([1, 2, 3]);
        expect(fetchWishlistIds).toHaveBeenCalledTimes(1);
    });
});
