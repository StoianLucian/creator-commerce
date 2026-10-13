"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import i18n from "@/i18n/i18n";
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
    successKey?: string
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,

        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? i18n.t("toasts.generic"));
                return;
            }

            if (successKey) {
                toast.success(i18n.t(successKey));
            }

            queryClient.invalidateQueries({ queryKey: cartQueryKey });
        },

        onError: () => {
            toast.error(i18n.t("toasts.generic"));
        },
    });
}

export function useAddToCart() {
    return useCartMutation<{ productId: number; quantity?: number }>(
        addToCart,
        "toasts.addedToCart"
    );
}

export function useUpdateCartQuantity() {
    return useCartMutation<{ productId: number; quantity: number }>(
        updateCartQuantity
    );
}

export function useRemoveFromCart() {
    return useCartMutation<{ productId: number }>(removeFromCart, "toasts.removedFromCart");
}

export function useClearCart() {
    return useCartMutation<void>(() => clearCart(), "toasts.cartCleared");
}
