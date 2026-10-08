import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useAddToCartMock, mutateMock } = vi.hoisted(() => ({
    useAddToCartMock: vi.fn(),
    mutateMock: vi.fn(),
}));

vi.mock("@/hooks/useCart", () => ({
    useAddToCart: useAddToCartMock,
}));

import { AddToCartButton } from "@/components/cart/AddToCartButton";

afterEach(() => {
    vi.clearAllMocks();
});

describe("AddToCartButton", () => {
    it("adds the product to the cart on click", async () => {
        const user = userEvent.setup();
        useAddToCartMock.mockReturnValue({ mutate: mutateMock, isPending: false });

        render(<AddToCartButton productId={42} productName="Cool Hat" quantity={3} />);

        const button = screen.getByRole("button", { name: /add cool hat to cart/i });
        await user.click(button);

        expect(mutateMock).toHaveBeenCalledWith({ productId: 42, quantity: 3 });
    });

    it("defaults the quantity to 1", async () => {
        const user = userEvent.setup();
        useAddToCartMock.mockReturnValue({ mutate: mutateMock, isPending: false });

        render(<AddToCartButton productId={7} productName="Mug" />);
        await user.click(screen.getByRole("button", { name: /add mug to cart/i }));

        expect(mutateMock).toHaveBeenCalledWith({ productId: 7, quantity: 1 });
    });

    it("is disabled while the mutation is pending", () => {
        useAddToCartMock.mockReturnValue({ mutate: mutateMock, isPending: true });

        render(<AddToCartButton productId={1} productName="Thing" />);

        expect(screen.getByRole("button", { name: /add thing to cart/i })).toBeDisabled();
    });
});
