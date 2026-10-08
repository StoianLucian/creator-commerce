import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useWishlistIdsMock, useToggleWishlistMock, mutateMock } = vi.hoisted(() => ({
    useWishlistIdsMock: vi.fn(),
    useToggleWishlistMock: vi.fn(),
    mutateMock: vi.fn(),
}));

vi.mock("@/hooks/useWishlist", () => ({
    useWishlistIds: useWishlistIdsMock,
    useToggleWishlist: useToggleWishlistMock,
}));

import { WishlistButton } from "@/components/wishlist/WishlistButton";

afterEach(() => {
    vi.clearAllMocks();
});

describe("WishlistButton", () => {
    it("reflects the unsaved state and offers to add", () => {
        useWishlistIdsMock.mockReturnValue({ data: [99] });
        useToggleWishlistMock.mockReturnValue({ mutate: mutateMock, isPending: false });

        render(<WishlistButton productId={42} productName="Cool Hat" />);

        const button = screen.getByRole("button", { name: /add cool hat to wishlist/i });
        expect(button).toHaveAttribute("aria-pressed", "false");
    });

    it("reflects the saved state when the id is present", () => {
        useWishlistIdsMock.mockReturnValue({ data: [42] });
        useToggleWishlistMock.mockReturnValue({ mutate: mutateMock, isPending: false });

        render(<WishlistButton productId={42} productName="Cool Hat" />);

        const button = screen.getByRole("button", {
            name: /remove cool hat from wishlist/i,
        });
        expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("toggles the wishlist on click", async () => {
        const user = userEvent.setup();
        useWishlistIdsMock.mockReturnValue({ data: [] });
        useToggleWishlistMock.mockReturnValue({ mutate: mutateMock, isPending: false });

        render(<WishlistButton productId={42} productName="Cool Hat" />);
        await user.click(screen.getByRole("button"));

        expect(mutateMock).toHaveBeenCalledWith({ productId: 42 });
    });

    it("is disabled while toggling", () => {
        useWishlistIdsMock.mockReturnValue({ data: [] });
        useToggleWishlistMock.mockReturnValue({ mutate: mutateMock, isPending: true });

        render(<WishlistButton productId={42} productName="Cool Hat" />);

        expect(screen.getByRole("button")).toBeDisabled();
    });
});
