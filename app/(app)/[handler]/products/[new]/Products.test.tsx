import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useOwnProductsMock, useUrlSearchMock, resetFiltersMock } = vi.hoisted(() => ({
    useOwnProductsMock: vi.fn(),
    useUrlSearchMock: vi.fn(),
    resetFiltersMock: vi.fn(),
}));

vi.mock("@/hooks/useOwnProducts", () => ({ useOwnProducts: useOwnProductsMock }));
vi.mock("@/hooks/use-url-search", () => ({ useUrlSearch: useUrlSearchMock }));
vi.mock("@/components/products-page/ProductFilters", () => ({
    ProductFilters: () => <div data-testid="filters" />,
}));
vi.mock("@/components/products-page/ProductCardWrapper", () => ({
    default: ({ products }: { products: { id: number }[] }) => (
        <div data-testid="grid">{products.length} products</div>
    ),
}));

import Products from "@/app/(app)/[handler]/products/[new]/Products";
import type { SearchFilters } from "@/hooks/use-url-search";

const defaultFilters: SearchFilters = {
    search: "",
    sort: "newest",
    minPrice: undefined,
    maxPrice: undefined,
    status: "all",
    categoryId: undefined,
};

function setup(opts: {
    products?: { id: number }[];
    isPending?: boolean;
    isError?: boolean;
    filters?: Partial<SearchFilters>;
}) {
    useUrlSearchMock.mockReturnValue({
        filters: { ...defaultFilters, ...opts.filters },
        setFilters: vi.fn(),
        searchDebounce: opts.filters?.search ?? "",
        resetFilters: resetFiltersMock,
    });
    useOwnProductsMock.mockReturnValue({
        data: opts.products ?? [],
        isPending: opts.isPending ?? false,
        isError: opts.isError ?? false,
        error: opts.isError ? new Error("boom") : null,
    });
}

beforeEach(() => {
    useOwnProductsMock.mockReset();
    useUrlSearchMock.mockReset();
    resetFiltersMock.mockReset();
});
afterEach(() => vi.clearAllMocks());

describe("Products (seller catalog)", () => {
    it('shows the "No products yet" empty state when there are none and no filters', () => {
        setup({ products: [] });
        render(<Products />);
        expect(screen.getByText(/no products yet/i)).toBeInTheDocument();
        expect(screen.getByText(/new product button above/i)).toBeInTheDocument();
        expect(screen.queryByTestId("grid")).toBeNull();
    });

    it('shows the "no matches" state + Clear filters when filters are active', async () => {
        setup({ products: [], filters: { search: "widget" } });
        render(<Products />);

        expect(screen.getByText(/no products match your filters/i)).toBeInTheDocument();

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /clear filters/i }));
        expect(resetFiltersMock).toHaveBeenCalledOnce();
    });

    it("treats a non-default status as an active filter", () => {
        setup({ products: [], filters: { status: "draft" } });
        render(<Products />);
        expect(screen.getByText(/no products match your filters/i)).toBeInTheDocument();
    });

    it("renders the grid when products exist", () => {
        setup({ products: [{ id: 1 }, { id: 2 }] });
        render(<Products />);
        expect(screen.getByTestId("grid")).toHaveTextContent("2 products");
        expect(screen.queryByText(/no products/i)).toBeNull();
    });

    it("shows an error card when the query fails", () => {
        setup({ isError: true });
        render(<Products />);
        expect(screen.getByText(/could not load your products/i)).toBeInTheDocument();
    });

    it("does not show an empty state while loading", () => {
        setup({ products: [], isPending: true });
        render(<Products />);
        expect(screen.queryByText(/no products yet/i)).toBeNull();
        expect(screen.getByTestId("grid")).toBeInTheDocument();
    });
});
