import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProducts } = vi.hoisted(() => ({ getProducts: vi.fn() }));

vi.mock("@/lib/actions/products", () => ({ getProducts }));

import { useProducts } from "@/hooks/useProducts";

function createWrapper() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client }, children);
}

describe("useProducts", () => {
    beforeEach(() => {
        getProducts.mockReset();
    });

    it("calls getProducts with the query args and surfaces the data", async () => {
        const data = [{ id: 1, name: "Shoes" }];
        getProducts.mockResolvedValue(data);

        const { result } = renderHook(
            () =>
                useProducts({
                    q: "shoe",
                    sort: "price-asc",
                    minPrice: 10,
                    maxPrice: 100,
                    categoryId: 2,
                }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(data);
        expect(getProducts).toHaveBeenCalledWith({
            q: "shoe",
            sort: "price-asc",
            minPrice: 10,
            maxPrice: 100,
            categoryId: 2,
        });
    });

    it("defaults sort to 'newest'", async () => {
        getProducts.mockResolvedValue([]);

        const { result } = renderHook(() => useProducts({ q: "" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(getProducts).toHaveBeenCalledWith(
            expect.objectContaining({ q: "", sort: "newest" })
        );
    });

    it("surfaces an error when the action rejects", async () => {
        getProducts.mockRejectedValue(new Error("boom"));

        const { result } = renderHook(() => useProducts({ q: "x" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe("boom");
    });
});
