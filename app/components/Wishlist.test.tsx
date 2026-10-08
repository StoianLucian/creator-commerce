import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useWishlistMock, useWishlistIdsMock, useUrlSearchMock, resetFiltersMock } =
    vi.hoisted(() => ({
        useWishlistMock: vi.fn(),
        useWishlistIdsMock: vi.fn(),
        useUrlSearchMock: vi.fn(),
        resetFiltersMock: vi.fn(),
    }));

vi.mock("@/hooks/useWishlist", () => ({
    useWishlist: useWishlistMock,
    useWishlistIds: useWishlistIdsMock,
}));

vi.mock("@/hooks/use-url-search", () => ({
    useUrlSearch: useUrlSearchMock,
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: any) => (
        <a href={typeof href === "string" ? href : "#"} {...props}>
            {children}
        </a>
    ),
}));

vi.mock("@/components/products-page/ProductCardWrapper", () => ({
    default: ({ products }: any) => (
        <div data-testid="product-grid">{products.length} products</div>
    ),
}));

vi.mock("@/components/products-page/ProductFilters", () => ({
    ProductFilters: () => <div data-testid="product-filters" />,
}));

import Wishlist from "@/app/components/Wishlist";
import { AppPaths } from "@/enums/AppPaths";

const baseFilters = {
    search: "",
    sort: "newest",
    minPrice: undefined,
    maxPrice: undefined,
    status: "all",
    categoryId: undefined,
};

function setup({
    ids = [] as number[],
    products = [] as unknown[],
    isPending = false,
}: {
    ids?: number[];
    products?: unknown[];
    isPending?: boolean;
}) {
    useUrlSearchMock.mockReturnValue({
        filters: baseFilters,
        setFilters: vi.fn(),
        searchDebounce: "",
        resetFilters: resetFiltersMock,
    });
    useWishlistIdsMock.mockReturnValue({ data: ids });
    useWishlistMock.mockReturnValue({ data: products, isPending });
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("Wishlist", () => {
    it("shows the empty-wishlist state with an Explore link when nothing is saved", () => {
        setup({ ids: [], products: [] });
        render(<Wishlist />);

        expect(screen.getByText("Your wishlist is empty")).toBeInTheDocument();
        // Rendered as a base-ui Button with a Link, so it carries role="button".
        expect(
            screen.getByRole("button", { name: /explore products/i }),
        ).toHaveAttribute("href", AppPaths.DASHBOARD);
        // Filters only render once something is saved.
        expect(screen.queryByTestId("product-filters")).toBeNull();
    });

    it("shows the no-matches state and resets filters when saved but filtered to none", async () => {
        const user = userEvent.setup();
        setup({ ids: [1, 2], products: [] });
        render(<Wishlist />);

        expect(
            screen.getByText("No saved products match your filters"),
        ).toBeInTheDocument();
        expect(screen.getByTestId("product-filters")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /reset filters/i }));
        expect(resetFiltersMock).toHaveBeenCalledTimes(1);
    });

    it("renders the grid when there are saved products that match", () => {
        setup({ ids: [1, 2], products: [{ id: 1 }, { id: 2 }] });
        render(<Wishlist />);

        expect(screen.getByTestId("product-grid")).toHaveTextContent("2 products");
        expect(screen.queryByText("Your wishlist is empty")).toBeNull();
    });
});
