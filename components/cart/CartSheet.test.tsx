import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const {
    useCartMock,
    useClearCartMock,
    useCheckoutMock,
    clearMutateMock,
    checkoutMutateMock,
    toastErrorMock,
} = vi.hoisted(() => ({
    useCartMock: vi.fn(),
    useClearCartMock: vi.fn(),
    useCheckoutMock: vi.fn(),
    clearMutateMock: vi.fn(),
    checkoutMutateMock: vi.fn(),
    toastErrorMock: vi.fn(),
}));

vi.mock("@/hooks/useCart", () => ({
    useCart: useCartMock,
    useClearCart: useClearCartMock,
}));

vi.mock("@/hooks/useCheckout", () => ({
    useCheckout: useCheckoutMock,
}));

vi.mock("sonner", () => ({
    toast: { error: toastErrorMock },
}));

// Passthrough the (portaled) sheet primitives so the content renders inline
// under jsdom without needing to open the slide-over.
vi.mock("@/components/ui/sheet", () => {
    const Pass = ({ children }: any) => <div>{children}</div>;
    return {
        Sheet: Pass,
        SheetTrigger: Pass,
        SheetContent: Pass,
        SheetHeader: Pass,
        SheetFooter: Pass,
        SheetTitle: ({ children }: any) => <h2>{children}</h2>,
        SheetDescription: ({ children }: any) => <p>{children}</p>,
    };
});

// Stub the line item — its own behaviour is covered by CartLineItem.test.
vi.mock("@/components/cart/CartLineItem", () => ({
    CartLineItem: ({ item }: any) => <li data-testid="line-item">{item.name}</li>,
}));

import { CartSheet } from "@/components/cart/CartSheet";

function setup({
    cart = { items: [], itemCount: 0, subtotal: 0 },
    isPending = false,
    isError = false,
    error = new Error("boom"),
}: {
    cart?: unknown;
    isPending?: boolean;
    isError?: boolean;
    error?: Error;
} = {}) {
    useCartMock.mockReturnValue({ data: cart, isPending, isError, error });
    useClearCartMock.mockReturnValue({ mutate: clearMutateMock, isPending: false });
    useCheckoutMock.mockReturnValue({ mutate: checkoutMutateMock, isPending: false });
}

const populatedCart = {
    itemCount: 3,
    subtotal: 45,
    items: [
        { productId: 1, name: "Cool Hat" },
        { productId: 2, name: "Nice Mug" },
    ],
};

afterEach(() => {
    vi.clearAllMocks();
});

describe("CartSheet", () => {
    it("shows the empty-cart state when there are no items", () => {
        setup();
        render(<CartSheet />);

        expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
        expect(screen.queryByTestId("line-item")).toBeNull();
        expect(screen.queryByRole("button", { name: /checkout/i })).toBeNull();
    });

    it("renders a line per item, the subtotal and a checkout affordance", () => {
        setup({ cart: populatedCart });
        render(<CartSheet />);

        expect(screen.getAllByTestId("line-item")).toHaveLength(2);
        // Real priceFormatter output for whole-dollar subtotal.
        expect(screen.getByText("$45")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /checkout/i })).toBeInTheDocument();
        expect(screen.queryByText("Your cart is empty")).toBeNull();
    });

    it("blocks checkout and toasts when signed out", async () => {
        const user = userEvent.setup();
        setup({ cart: populatedCart });
        render(<CartSheet isSignedIn={false} />);

        await user.click(screen.getByRole("button", { name: /checkout/i }));

        expect(toastErrorMock).toHaveBeenCalledWith("Please log in to make purchases");
        expect(checkoutMutateMock).not.toHaveBeenCalled();
    });

    it("runs checkout when signed in", async () => {
        const user = userEvent.setup();
        setup({ cart: populatedCart });
        render(<CartSheet isSignedIn />);

        await user.click(screen.getByRole("button", { name: /checkout/i }));

        expect(checkoutMutateMock).toHaveBeenCalledTimes(1);
        expect(toastErrorMock).not.toHaveBeenCalled();
    });

    it("clears the cart from the footer action", async () => {
        const user = userEvent.setup();
        setup({ cart: populatedCart });
        render(<CartSheet isSignedIn />);

        await user.click(screen.getByRole("button", { name: /clear cart/i }));

        expect(clearMutateMock).toHaveBeenCalledTimes(1);
    });

    it("surfaces a load error", () => {
        setup({ isError: true, error: new Error("network down") });
        render(<CartSheet />);

        expect(screen.getByText("Could not load your cart")).toBeInTheDocument();
        expect(screen.getByText("network down")).toBeInTheDocument();
    });
});
