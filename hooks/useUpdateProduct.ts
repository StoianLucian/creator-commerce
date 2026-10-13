"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateProductInput } from "@/form-validations/products";
import { updateProduct } from "@/lib/actions/products";
import { toast } from "sonner";
import i18n from "@/i18n/i18n";

export function useUpdateProduct(id: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductInput) => updateProduct(id, data),

        onError: () => {
            toast.error(i18n.t("toasts.productUpdateError"));
        },
        onSuccess: () => {
            toast.success(i18n.t("toasts.productUpdated"));
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["products-own"] });
        },
    });
}
