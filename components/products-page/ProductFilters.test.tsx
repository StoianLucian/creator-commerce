import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useCategoriesMock } = vi.hoisted(() => ({
    useCategoriesMock: vi.fn(),
}));

vi.mock("@/hooks/useCategories", () => ({
    useCategories: useCategoriesMock,
}));

// Base UI's Select is portaled and awkward to drive under jsdom. Stub it so
// each SelectItem is a button that reports its value through the owning
// Select's onValueChange, and the trigger keeps its aria-label for lookups.
vi.mock("@/components/ui/select", () => {
    const SelectCtx = React.createContext<(value: string) => void>(() => {});
    return {
        Select: ({ onValueChange, children }: any) => (
            <SelectCtx.Provider value={onValueChange}>
                <div>{children}</div>
            </SelectCtx.Provider>
        ),
        SelectTrigger: ({ children, "aria-label": ariaLabel }: any) => (
            <div aria-label={ariaLabel}>{children}</div>
        ),
        SelectContent: ({ children }: any) => <>{children}</>,
        SelectItem: ({ value, children }: any) => {
            const onValueChange = React.useContext(SelectCtx);
            return (
                <button type="button" onClick={() => onValueChange(value)}>
                    {children}
                </button>
            );
        },
        SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
    };
});

// Passthrough the popover so the price inputs render inline.
vi.mock("@/components/ui/popover", () => {
    const Pass = ({ children }: any) => <div>{children}</div>;
    return { Popover: Pass, PopoverTrigger: Pass, PopoverContent: Pass };
});

import { ProductFilters } from "@/components/products-page/ProductFilters";

const baseFilters = {
    search: "",
    sort: "newest" as const,
    minPrice: undefined,
    maxPrice: undefined,
    status: "all" as const,
    categoryId: undefined,
};

function renderFilters(props: Partial<React.ComponentProps<typeof ProductFilters>> = {}) {
    const prev = { ...baseFilters, ...(props.filters ?? {}) };
    // Evaluate the functional updater eagerly, inside the event handler, so a
    // synthetic event's `target.value` is read while still live (a controlled
    // input whose value never changes resets the DOM value after each key).
    const results: object[] = [];
    const setFilters = vi.fn((arg: unknown) => {
        results.push(typeof arg === "function" ? (arg as any)(prev) : arg);
    });
    const resetFilters = vi.fn();
    render(
        <ProductFilters
            filters={prev}
            setFilters={setFilters}
            resetFilters={resetFilters}
            searchPlaceholder={props.searchPlaceholder}
            showStatus={props.showStatus}
        />,
    );
    return { setFilters, resetFilters, results };
}

beforeEach(() => {
    useCategoriesMock.mockReturnValue({ data: [{ id: 1, name: "Hats" }] });
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("ProductFilters", () => {
    it("honors the searchPlaceholder prop", () => {
        renderFilters({ searchPlaceholder: "Find your thing..." });
        expect(screen.getByPlaceholderText("Find your thing...")).toBeInTheDocument();
    });

    it("defaults the search placeholder", () => {
        renderFilters();
        expect(screen.getByPlaceholderText("Search products...")).toBeInTheDocument();
    });

    it("updates search as the user types", async () => {
        const user = userEvent.setup();
        const { setFilters, results } = renderFilters();

        await user.type(screen.getByRole("textbox", { name: /search products/i }), "h");

        expect(setFilters).toHaveBeenCalled();
        expect(results.at(-1)).toEqual({ ...baseFilters, search: "h" });
    });

    it("updates the sort when a sort option is chosen", async () => {
        const user = userEvent.setup();
        const { results } = renderFilters();

        await user.click(screen.getByRole("button", { name: "Price: Low to High" }));

        expect(results.at(-1)).toEqual({ ...baseFilters, sort: "price-asc" });
    });

    it("updates the category when a category option is chosen", async () => {
        const user = userEvent.setup();
        const { results } = renderFilters();

        await user.click(screen.getByRole("button", { name: "Hats" }));

        expect(results.at(-1)).toEqual({ ...baseFilters, categoryId: 1 });
    });

    it("applies an edited price range", async () => {
        const user = userEvent.setup();
        const { results } = renderFilters();

        await user.type(screen.getByLabelText("Min"), "10");
        await user.type(screen.getByLabelText("Max"), "50");
        await user.click(screen.getByRole("button", { name: "Apply" }));

        expect(results.at(-1)).toEqual({ ...baseFilters, minPrice: 10, maxPrice: 50 });
    });

    it("hides the status control when showStatus is false", () => {
        renderFilters({ showStatus: false });
        expect(screen.queryByLabelText("Filter by status")).toBeNull();
    });

    it("renders the status control when showStatus is true", () => {
        renderFilters({ showStatus: true });
        expect(screen.getByLabelText("Filter by status")).toBeInTheDocument();
    });

    it("calls resetFilters from the Reset control when filters are active", async () => {
        const user = userEvent.setup();
        const { resetFilters } = renderFilters({
            filters: { ...baseFilters, search: "shoes" },
        });

        await user.click(screen.getByRole("button", { name: /reset filters/i }));

        expect(resetFilters).toHaveBeenCalledTimes(1);
    });

    it("hides the Reset control when no filters are active", () => {
        renderFilters();
        expect(screen.queryByRole("button", { name: /reset filters/i })).toBeNull();
    });
});
