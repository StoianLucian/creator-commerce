import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchCart, addToCart, clearCart, removeFromCart, updateCartQuantity } =
    vi.hoisted(() => ({
        fetchCart: vi.fn(),
        addToCart: vi.fn(),
        clearCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateCartQuantity: vi.fn(),
    }));

vi.mock("@/lib/actions/cart", () => ({
    fetchCart,
    addToCart,
    clearCart,
    removeFromCart,
    updateCartQuantity,
}));

// sonner's toast is pulled in by useCart's mutation helpers; stub it so the
// module graph resolves cleanly in jsdom.
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useCart } from "@/hooks/useCart";

function createWrapper() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client }, children);
}

describe("useCart", () => {
    beforeEach(() => {
        fetchCart.mockReset();
    });

    it("surfaces the cart from fetchCart", async () => {
        const data = { items: [{ productId: 1, quantity: 2 }], total: 50 };
        fetchCart.mockResolvedValue(data);

        const { result } = renderHook(() => useCart(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(data);
        expect(fetchCart).toHaveBeenCalledTimes(1);
    });
});
