import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getOwnnProducts, deleteProduct } = vi.hoisted(() => ({
    getOwnnProducts: vi.fn(),
    deleteProduct: vi.fn(),
}));

vi.mock("@/lib/actions/products", () => ({ getOwnnProducts, deleteProduct }));

import { useOwnProducts } from "@/hooks/useOwnProducts";

function createWrapper() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client }, children);
}

describe("useOwnProducts", () => {
    beforeEach(() => {
        getOwnnProducts.mockReset();
    });

    it("calls getOwnnProducts with the query args and surfaces the data", async () => {
        const data = [{ id: 7, name: "My Product" }];
        getOwnnProducts.mockResolvedValue(data);

        const { result } = renderHook(
            () =>
                useOwnProducts({
                    q: "my",
                    sort: "most-sold",
                    status: "active",
                    categoryId: 4,
                }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(data);
        expect(getOwnnProducts).toHaveBeenCalledWith({
            q: "my",
            sort: "most-sold",
            minPrice: undefined,
            maxPrice: undefined,
            status: "active",
            categoryId: 4,
        });
    });

    it("defaults sort to 'newest' and status to 'all'", async () => {
        getOwnnProducts.mockResolvedValue([]);

        const { result } = renderHook(() => useOwnProducts({ q: "" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(getOwnnProducts).toHaveBeenCalledWith(
            expect.objectContaining({ sort: "newest", status: "all" })
        );
    });
});
