import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Hoisted mock state so the next/navigation factory and the tests share it.
const { mockReplace, state } = vi.hoisted(() => ({
    mockReplace: vi.fn(),
    state: { search: "", pathname: "/products" },
}));

vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(state.search),
    useRouter: () => ({ replace: mockReplace }),
    usePathname: () => state.pathname,
}));

import { useUrlSearch } from "@/hooks/use-url-search";

describe("useUrlSearch", () => {
    beforeEach(() => {
        mockReplace.mockClear();
        state.search = "";
        state.pathname = "/products";
    });

    it("parses the initial filters from the search params", () => {
        state.search =
            "q=hello&sort=price-asc&minPrice=10&maxPrice=50&status=active&category=3";

        const { result } = renderHook(() => useUrlSearch());

        expect(result.current.filters).toEqual({
            search: "hello",
            sort: "price-asc",
            minPrice: 10,
            maxPrice: 50,
            status: "active",
            categoryId: 3,
        });
    });

    it("falls back to defaults when params are absent", () => {
        const { result } = renderHook(() => useUrlSearch());

        expect(result.current.filters).toEqual({
            search: "",
            sort: "newest",
            minPrice: undefined,
            maxPrice: undefined,
            status: "all",
            categoryId: undefined,
        });
    });

    it("ignores invalid price and category values", () => {
        state.search = "minPrice=-5&maxPrice=abc&category=0";

        const { result } = renderHook(() => useUrlSearch());

        expect(result.current.filters.minPrice).toBeUndefined();
        expect(result.current.filters.maxPrice).toBeUndefined();
        expect(result.current.filters.categoryId).toBeUndefined();
    });

    it("ignores a non-integer category value", () => {
        state.search = "category=2.5";

        const { result } = renderHook(() => useUrlSearch());

        expect(result.current.filters.categoryId).toBeUndefined();
    });

    it("reads a custom param name", () => {
        state.search = "term=boots";

        const { result } = renderHook(() => useUrlSearch("term"));

        expect(result.current.filters.search).toBe("boots");
    });

    it("setFilters updates the filter state", () => {
        const { result } = renderHook(() => useUrlSearch());

        act(() => {
            result.current.setFilters((prev) => ({ ...prev, sort: "most-sold" }));
        });

        expect(result.current.filters.sort).toBe("most-sold");
    });

    it("resetFilters restores the defaults", () => {
        state.search = "q=hello&sort=price-asc&minPrice=10&category=3";

        const { result } = renderHook(() => useUrlSearch());

        act(() => {
            result.current.resetFilters();
        });

        expect(result.current.filters).toEqual({
            search: "",
            sort: "newest",
            minPrice: undefined,
            maxPrice: undefined,
            status: "all",
            categoryId: undefined,
        });
    });

    it("calls router.replace with an updated query when a non-debounced filter changes", () => {
        const { result } = renderHook(() => useUrlSearch());

        // No replace on mount: parsed filters already match the URL.
        expect(mockReplace).not.toHaveBeenCalled();

        act(() => {
            result.current.setFilters((prev) => ({ ...prev, sort: "price-asc" }));
        });

        expect(mockReplace).toHaveBeenCalledTimes(1);
        const [url, opts] = mockReplace.mock.calls[0];
        expect(url).toContain("sort=price-asc");
        expect(url.startsWith("/products?")).toBe(true);
        expect(opts).toEqual({ scroll: false });
    });

    it("debounces the search before calling router.replace", () => {
        vi.useFakeTimers();
        try {
            const { result } = renderHook(() => useUrlSearch());

            act(() => {
                result.current.setFilters((prev) => ({ ...prev, search: "shoes" }));
            });

            // Debounce has not elapsed yet, so no navigation.
            expect(mockReplace).not.toHaveBeenCalled();

            act(() => {
                vi.advanceTimersByTime(300);
            });

            expect(mockReplace).toHaveBeenCalledTimes(1);
            const [url] = mockReplace.mock.calls[0];
            expect(url).toContain("q=shoes");
        } finally {
            vi.useRealTimers();
        }
    });
});
