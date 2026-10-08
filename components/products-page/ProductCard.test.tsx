import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { pushMock } = vi.hoisted(() => ({
    pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/components/cart/AddToCartButton", () => ({
    AddToCartButton: ({ productName }: { productName: string }) => (
        <div data-testid="add-to-cart">{productName}</div>
    ),
}));

vi.mock("@/components/wishlist/WishlistButton", () => ({
    WishlistButton: ({ productName }: { productName: string }) => (
        <div data-testid="wishlist">{productName}</div>
    ),
}));

vi.mock("@/components/products-page/DeleteProductButton", () => ({
    DeleteProductButton: ({ label }: { label?: string }) => (
        <div data-testid="delete-product">{label}</div>
    ),
}));

import { ProductCard } from "@/components/products-page/ProductCard";
import { CreatorPaths, DashboardPaths } from "@/enums/AppPaths";
import type { ProductWithRelations } from "@/lib/actions/products";

afterEach(() => {
    vi.clearAllMocks();
});

function makeProduct(
    overrides: Partial<ProductWithRelations> = {},
): ProductWithRelations {
    return {
        id: 42,
        name: "Cool Shirt",
        slug: "cool-shirt",
        description: "A very cool shirt",
        price: 2500,
        status: "active",
        sold: 7,
        images: [{ imageUrl: "https://img.test/shirt.jpg" }],
        owner: { username: "lucians" },
        deleted_at: null,
        ...overrides,
    } as ProductWithRelations;
}

describe("ProductCard", () => {
    it("links non-editable cards to the buyer-facing Explore detail", () => {
        const product = makeProduct();
        render(<ProductCard product={product} />);

        const link = screen.getByRole("link");
        expect(link).toHaveAttribute(
            "href",
            DashboardPaths.product("lucians", 42, "cool-shirt"),
        );
    });

    it("links editable cards to the creator management detail", () => {
        const product = makeProduct();
        render(<ProductCard product={product} editable />);

        const link = screen.getByRole("link");
        expect(link).toHaveAttribute(
            "href",
            CreatorPaths.product("lucians", 42, "cool-shirt"),
        );
    });

    it("shows AddToCart and the wishlist heart on non-editable cards", () => {
        render(<ProductCard product={makeProduct()} />);

        expect(screen.getByTestId("add-to-cart")).toBeInTheDocument();
        expect(screen.getByTestId("wishlist")).toBeInTheDocument();
        expect(screen.queryByTestId("delete-product")).toBeNull();
        expect(screen.queryByRole("button", { name: /edit/i })).toBeNull();
    });

    it("shows Edit / Delete / View actions and no wishlist on editable cards", () => {
        render(<ProductCard product={makeProduct()} editable />);

        expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByTestId("delete-product")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /view/i })).toBeInTheDocument();
        expect(screen.queryByTestId("wishlist")).toBeNull();
        expect(screen.queryByTestId("add-to-cart")).toBeNull();
    });

    it("renders a deleted product without a link and with a Deleted badge", () => {
        const product = makeProduct({ deleted_at: new Date() });
        render(<ProductCard product={product} editable />);

        expect(screen.queryByRole("link")).toBeNull();
        expect(screen.getByText("Deleted")).toBeInTheDocument();
        // Deleted products have no action row.
        expect(screen.queryByTestId("delete-product")).toBeNull();
        expect(screen.queryByTestId("wishlist")).toBeNull();
    });

    it("navigates on Edit and View clicks via the router", async () => {
        const { default: userEvent } = await import("@testing-library/user-event");
        const user = userEvent.setup();
        render(<ProductCard product={makeProduct()} editable />);

        await user.click(screen.getByRole("button", { name: /edit/i }));
        expect(pushMock).toHaveBeenCalledWith(
            CreatorPaths.productEdit("lucians", 42),
        );

        await user.click(screen.getByRole("button", { name: /view/i }));
        expect(pushMock).toHaveBeenCalledWith(
            CreatorPaths.product("lucians", 42, "cool-shirt"),
        );
    });

    it("falls back to a placeholder when there is no description", () => {
        render(<ProductCard product={makeProduct({ description: "" })} />);
        expect(screen.getByText("No description yet")).toBeInTheDocument();
    });
});
