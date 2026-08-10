"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    addToCart,
    clearCart,
    fetchCart,
    removeFromCart,
    updateCartQuantity,
} from "@/lib/actions/cart";
import type { Cart } from "@/lib/data/cart";

export const cartQueryKey = ["cart"] as const;

export function useCart() {
    return useQuery<Cart, Error>({
        queryKey: cartQueryKey,
        queryFn: () => fetchCart(),
    });
}

/**
 * Shared mutation wiring: surface the action's own error message and
 * refresh the cart afterwards so the badge and sheet stay in sync.
 */
function useCartMutation<TInput>(
    mutationFn: (input: TInput) => Promise<{ success: boolean; error?: string }>,
    successMessage?: string
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,

        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? "Something went wrong");
                return;
            }

            if (successMessage) {
                toast.success(successMessage);
            }

            queryClient.invalidateQueries({ queryKey: cartQueryKey });
        },

        onError: () => {
            toast.error("Something went wrong");
        },
    });
}

export function useAddToCart() {
    return useCartMutation<{ productId: number; quantity?: number }>(
        addToCart,
        "Added to cart"
    );
}

export function useUpdateCartQuantity() {
    return useCartMutation<{ productId: number; quantity: number }>(
        updateCartQuantity
    );
}

export function useRemoveFromCart() {
    return useCartMutation<{ productId: number }>(removeFromCart, "Removed from cart");
}

export function useClearCart() {
    return useCartMutation<void>(() => clearCart(), "Cart cleared");
}
