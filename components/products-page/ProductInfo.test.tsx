import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProductInfo } from "./ProductInfo";
import type { ProductDetail } from "@/lib/actions/products";

afterEach(() => {
    vi.clearAllMocks();
});

function makeProduct(overrides: Partial<ProductDetail> = {}): ProductDetail {
    return {
        id: 1,
        name: "Cool Shirt",
        slug: "cool-shirt",
        description: "A very cool shirt",
        price: 2500, // whole dollars -> $2,500
        status: "active",
        sold: 7,
        category: { id: 3, name: "Apparel" },
        images: [
            { id: 1, imageUrl: "https://img.test/one.jpg" },
            { id: 2, imageUrl: "https://img.test/two.jpg" },
        ],
        ...overrides,
    } as ProductDetail;
}

describe("ProductInfo", () => {
    it("renders the description panel with the product's description", () => {
        render(<ProductInfo product={makeProduct()} />);
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("A very cool shirt")).toBeInTheDocument();
    });

    it("falls back to a placeholder when there is no description", () => {
        render(<ProductInfo product={makeProduct({ description: "" })} />);
        expect(screen.getByText("No description yet")).toBeInTheDocument();
    });

    it("renders the product information panel with category, price, sold and image count", () => {
        render(<ProductInfo product={makeProduct()} />);

        expect(screen.getByText("Category")).toBeInTheDocument();
        expect(screen.getByText("Apparel")).toBeInTheDocument();

        expect(screen.getByText("Price")).toBeInTheDocument();
        // priceFormatter: whole dollars, no fraction -> $2,500
        expect(screen.getByText("$2,500")).toBeInTheDocument();

        expect(screen.getByText("Sold")).toBeInTheDocument();
        expect(screen.getByText("7 units")).toBeInTheDocument();

        expect(screen.getByText("Images")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("falls back to Uncategorized when there is no category", () => {
        render(<ProductInfo product={makeProduct({ category: undefined })} />);
        expect(screen.getByText("Uncategorized")).toBeInTheDocument();
    });

    it("renders the status panel with the product status", () => {
        render(<ProductInfo product={makeProduct({ status: "draft" })} />);
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("draft")).toBeInTheDocument();
    });
});
