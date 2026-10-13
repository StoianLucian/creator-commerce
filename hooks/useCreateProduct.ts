"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateProductInput } from "@/form-validations/products";
import { createProduct } from "@/lib/actions/products";
import { toast } from "sonner";
import i18n from "@/i18n/i18n";


export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductInput) => createProduct(data),

        onError: () => {
            toast.error(i18n.t("toasts.productCreateError"));
        },
        onSuccess: () => {
            toast.success(i18n.t("toasts.productCreated"));
            queryClient.invalidateQueries({
                queryKey: ["products"],
            });
        },
    });
}