import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useUpdateCartQuantityMock, useRemoveFromCartMock, updateMock, removeMock } =
    vi.hoisted(() => ({
        useUpdateCartQuantityMock: vi.fn(),
        useRemoveFromCartMock: vi.fn(),
        updateMock: vi.fn(),
        removeMock: vi.fn(),
    }));

vi.mock("@/hooks/useCart", () => ({
    useUpdateCartQuantity: useUpdateCartQuantityMock,
    useRemoveFromCart: useRemoveFromCartMock,
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: any) => (
        <a href={typeof href === "string" ? href : "#"} {...props}>
            {children}
        </a>
    ),
}));

import { CartLineItem } from "@/components/cart/CartLineItem";
import type { CartItem } from "@/lib/data/cart";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
    return {
        productId: 5,
        quantity: 2,
        name: "Cool Hat",
        slug: "cool-hat",
        price: 15,
        lineTotal: 30,
        imageUrl: null,
        ownerUsername: "lucians",
        ...overrides,
    };
}

function setup() {
    useUpdateCartQuantityMock.mockReturnValue({ mutate: updateMock, isPending: false });
    useRemoveFromCartMock.mockReturnValue({ mutate: removeMock, isPending: false });
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("CartLineItem", () => {
    it("renders the name, unit price and line total", () => {
        setup();
        render(<CartLineItem item={makeItem()} />);

        expect(screen.getByText("Cool Hat")).toBeInTheDocument();
        expect(screen.getByText("$15 each")).toBeInTheDocument();
        // Line total formatted via the real priceFormatter.
        expect(screen.getByText("$30")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("increments the quantity with the product id", async () => {
        const user = userEvent.setup();
        setup();
        render(<CartLineItem item={makeItem()} />);

        await user.click(screen.getByRole("button", { name: /increase quantity of cool hat/i }));

        expect(updateMock).toHaveBeenCalledWith({ productId: 5, quantity: 3 });
    });

    it("decrements the quantity with the product id", async () => {
        const user = userEvent.setup();
        setup();
        render(<CartLineItem item={makeItem()} />);

        await user.click(screen.getByRole("button", { name: /decrease quantity of cool hat/i }));

        expect(updateMock).toHaveBeenCalledWith({ productId: 5, quantity: 1 });
    });

    it("removes the item with the product id", async () => {
        const user = userEvent.setup();
        setup();
        render(<CartLineItem item={makeItem()} />);

        await user.click(screen.getByRole("button", { name: /remove cool hat from cart/i }));

        expect(removeMock).toHaveBeenCalledWith({ productId: 5 });
    });

    it("disables the controls while a mutation is pending", () => {
        useUpdateCartQuantityMock.mockReturnValue({ mutate: updateMock, isPending: true });
        useRemoveFromCartMock.mockReturnValue({ mutate: removeMock, isPending: false });
        render(<CartLineItem item={makeItem()} />);

        expect(
            screen.getByRole("button", { name: /increase quantity of cool hat/i }),
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: /remove cool hat from cart/i }),
        ).toBeDisabled();
    });

    it("links to the product page when an owner is known", () => {
        setup();
        render(<CartLineItem item={makeItem()} />);

        const link = screen.getByRole("link", { name: "Cool Hat" });
        expect(link).toHaveAttribute("href", "/@lucians/products/5/cool-hat");
    });
});
