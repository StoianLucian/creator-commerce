import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useProductsMock, useUrlSearchMock, resetFiltersMock } = vi.hoisted(() => ({
    useProductsMock: vi.fn(),
    useUrlSearchMock: vi.fn(),
    resetFiltersMock: vi.fn(),
}));

vi.mock("@/hooks/useProducts", () => ({
    useProducts: useProductsMock,
}));

vi.mock("@/hooks/use-url-search", () => ({
    useUrlSearch: useUrlSearchMock,
}));

vi.mock("@/components/products-page/ProductCardWrapper", () => ({
    default: ({ products }: any) => (
        <div data-testid="product-grid">{products.length} products</div>
    ),
}));

vi.mock("@/components/products-page/ProductFilters", () => ({
    ProductFilters: () => <div data-testid="product-filters" />,
}));

import Dashboard from "@/app/components/Dashboard";

const baseFilters = {
    search: "",
    sort: "newest",
    minPrice: undefined,
    maxPrice: undefined,
    status: "all",
    categoryId: undefined,
};

function setup({
    filters = {},
    products = [] as unknown[],
    isPending = false,
}: {
    filters?: Partial<typeof baseFilters>;
    products?: unknown[];
    isPending?: boolean;
}) {
    useUrlSearchMock.mockReturnValue({
        filters: { ...baseFilters, ...filters },
        setFilters: vi.fn(),
        searchDebounce: "",
        resetFilters: resetFiltersMock,
    });
    useProductsMock.mockReturnValue({ data: products, isPending });
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("Dashboard", () => {
    it("shows the 'No products yet' empty state with no products and no filters", () => {
        setup({ products: [] });
        render(<Dashboard />);

        expect(screen.getByText("No products yet")).toBeInTheDocument();
        expect(screen.queryByTestId("product-grid")).toBeNull();
    });

    it("shows the filtered empty state and clears filters on click", async () => {
        const user = userEvent.setup();
        setup({ products: [], filters: { search: "shoes" } });
        render(<Dashboard />);

        expect(screen.getByText("No products match your filters")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /clear filters/i }));
        expect(resetFiltersMock).toHaveBeenCalledTimes(1);
    });

    it("renders the grid when there are products", () => {
        setup({ products: [{ id: 1 }, { id: 2 }] });
        render(<Dashboard />);

        expect(screen.getByTestId("product-grid")).toHaveTextContent("2 products");
        expect(screen.queryByText("No products yet")).toBeNull();
    });
});
