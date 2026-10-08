import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMySales } = vi.hoisted(() => ({ fetchMySales: vi.fn() }));

vi.mock("@/lib/actions/orders", () => ({ fetchMySales }));

import { useSales } from "@/hooks/useSales";

function createWrapper() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client }, children);
}

describe("useSales", () => {
    beforeEach(() => {
        fetchMySales.mockReset();
    });

    it("surfaces the sales from fetchMySales", async () => {
        const data = [{ id: 10, total: 42 }];
        fetchMySales.mockResolvedValue(data);

        const { result } = renderHook(() => useSales(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(data);
        expect(fetchMySales).toHaveBeenCalledTimes(1);
    });
});
