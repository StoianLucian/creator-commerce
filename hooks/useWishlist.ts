"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import i18n from "@/i18n/i18n";
import {
    fetchWishlist,
    fetchWishlistIds,
    removeFromWishlist,
    toggleWishlist,
} from "@/lib/actions/wishlist";
import type { ProductWithRelations } from "@/lib/actions/products";
import type { WishlistFilters } from "@/lib/data/wishlist";

// Every key shares the "wishlist" prefix, so invalidating `wishlistQueryKey`
// refreshes the full list (any filter combination) and the ids query (the
// hearts) in one call.
export const wishlistQueryKey = ["wishlist"] as const;
export const wishlistIdsQueryKey = ["wishlist", "ids"] as const;

/** Full hydrated wishlist, for the wishlist page. Filtered server-side. */
export function useWishlist(filters: WishlistFilters) {
    const { q, sort, minPrice, maxPrice, categoryId } = filters;

    return useQuery<ProductWithRelations[], Error>({
        queryKey: ["wishlist", "list", q, sort, minPrice, maxPrice, categoryId],
        queryFn: () => fetchWishlist(filters),
    });
}

/** Just the saved ids — what each heart reads to show its toggled state. */
export function useWishlistIds() {
    return useQuery<number[], Error>({
        queryKey: wishlistIdsQueryKey,
        queryFn: () => fetchWishlistIds(),
    });
}

export function useToggleWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleWishlist,

        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? i18n.t("toasts.generic"));
                return;
            }

            toast.success(
                i18n.t(result.wishlisted ? "toasts.addedToWishlist" : "toasts.removedFromWishlist")
            );

            queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
        },

        onError: () => {
            toast.error(i18n.t("toasts.generic"));
        },
    });
}

export function useRemoveFromWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeFromWishlist,

        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? i18n.t("toasts.generic"));
                return;
            }

            toast.success(i18n.t("toasts.removedFromWishlist"));

            queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
        },

        onError: () => {
            toast.error(i18n.t("toasts.generic"));
        },
    });
}
