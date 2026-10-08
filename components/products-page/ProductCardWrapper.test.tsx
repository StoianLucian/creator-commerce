import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/products-page/ProductCard", () => ({
    ProductCard: ({
        product,
        editable,
    }: {
        product: { id: number };
        editable?: boolean;
    }) => (
        <div data-testid="product-card" data-editable={String(Boolean(editable))}>
            {product.id}
        </div>
    ),
}));

import ProductCardWrapper from "@/components/products-page/ProductCardWrapper";
import type { ProductWithRelations } from "@/lib/actions/products";

afterEach(() => {
    vi.clearAllMocks();
});

const products = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
] as ProductWithRelations[];

describe("ProductCardWrapper", () => {
    it("renders six skeletons while pending and no product cards", () => {
        const { container } = render(
            <ProductCardWrapper products={products} isPending />,
        );

        expect(
            container.querySelectorAll('[data-slot="skeleton"]'),
        ).toHaveLength(6);
        expect(screen.queryByTestId("product-card")).toBeNull();
    });

    it("renders one ProductCard per product when not pending", () => {
        render(<ProductCardWrapper products={products} isPending={false} />);

        const cards = screen.getAllByTestId("product-card");
        expect(cards).toHaveLength(3);
        expect(cards.map((c) => c.textContent)).toEqual(["1", "2", "3"]);
    });

    it("forwards the editable flag to each ProductCard", () => {
        render(
            <ProductCardWrapper products={products} isPending={false} editable />,
        );

        for (const card of screen.getAllByTestId("product-card")) {
            expect(card).toHaveAttribute("data-editable", "true");
        }
    });
});
