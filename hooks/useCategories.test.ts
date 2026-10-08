import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCategories } = vi.hoisted(() => ({ getCategories: vi.fn() }));

vi.mock("@/lib/data/categories", () => ({ getCategories }));

import { useCategories } from "@/hooks/useCategories";

function createWrapper() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client }, children);
}

describe("useCategories", () => {
    beforeEach(() => {
        getCategories.mockReset();
    });

    it("surfaces the categories from getCategories", async () => {
        const data = [{ id: 1, name: "Apparel" }];
        getCategories.mockResolvedValue(data);

        const { result } = renderHook(() => useCategories(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(data);
        expect(getCategories).toHaveBeenCalledTimes(1);
    });
});
