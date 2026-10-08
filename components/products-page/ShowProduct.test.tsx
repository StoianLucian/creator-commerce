import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/cart/AddToCartButton", () => ({
    AddToCartButton: ({ productName }: { productName: string }) => (
        <div data-testid="add-to-cart">{productName}</div>
    ),
}));

vi.mock("@/components/products-page/DeleteProductButton", () => ({
    DeleteProductButton: ({ label }: { label?: string }) => (
        <div data-testid="delete-product">{label}</div>
    ),
}));

vi.mock("@/components/products-page/ProductGallery", () => ({
    ProductGallery: () => <div data-testid="gallery" />,
}));

vi.mock("@/components/products-page/ProductInfo", () => ({
    ProductInfo: () => <div data-testid="info" />,
}));

import { ShowProduct } from "@/components/products-page/ShowProduct";
import { AppPaths, CreatorPaths } from "@/enums/AppPaths";
import type { ProductDetail } from "@/lib/actions/products";

afterEach(() => {
    vi.clearAllMocks();
});

function makeProduct(
    overrides: Partial<ProductDetail> = {},
): ProductDetail {
    return {
        id: 42,
        name: "Cool Shirt",
        slug: "cool-shirt",
        description: "A very cool shirt",
        price: 2500,
        status: "active",
        sold: 7,
        images: [{ imageUrl: "https://img.test/shirt.jpg" }],
        category: { name: "Apparel" },
        ...overrides,
    } as ProductDetail;
}

describe("ShowProduct", () => {
    it("shows owner-only actions and no Add to Cart when isOwner", () => {
        render(
            <ShowProduct product={makeProduct()} username="lucians" isOwner />,
        );

        expect(
            screen.getByRole("link", { name: /edit product/i }),
        ).toHaveAttribute("href", `${CreatorPaths.products("lucians")}/42/edit`);
        expect(screen.getByTestId("delete-product")).toHaveTextContent(
            "Delete Product",
        );
        expect(screen.queryByTestId("add-to-cart")).toBeNull();
    });

    it("points the back link at the owner's products list when isOwner", () => {
        render(
            <ShowProduct product={makeProduct()} username="lucians" isOwner />,
        );

        const back = screen.getByRole("link", { name: /back to products/i });
        expect(back).toHaveAttribute("href", CreatorPaths.products("lucians"));
    });

    it("shows Add to Cart and no owner actions when not the owner", () => {
        render(<ShowProduct product={makeProduct()} username="lucians" />);

        expect(screen.getByTestId("add-to-cart")).toBeInTheDocument();
        expect(screen.queryByTestId("delete-product")).toBeNull();
        expect(
            screen.queryByRole("link", { name: /edit product/i }),
        ).toBeNull();
    });

    it("points the back link at the Explore dashboard when not the owner", () => {
        render(<ShowProduct product={makeProduct()} username="lucians" />);

        const back = screen.getByRole("link", { name: /back to explore/i });
        expect(back).toHaveAttribute("href", AppPaths.DASHBOARD);
    });
});
