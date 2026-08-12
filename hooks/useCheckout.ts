"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createCheckoutSession } from "@/lib/actions/checkout";

/**
 * Kicks off Stripe Checkout for the current cart and redirects the whole
 * page to Stripe's hosted page — there's no client-side Stripe.js needed
 * for this flow, just the URL Checkout Sessions API hands back.
 */
export function useCheckout() {
    return useMutation({
        mutationFn: createCheckoutSession,

        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error, { position: "top-left" });
                return;
            }

            window.location.assign(result.url);
        },

        onError: () => {
            toast.error("Could not start checkout");
        },
    });
}
