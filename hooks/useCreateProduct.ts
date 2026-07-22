"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateProductInput } from "@/form-validations/products";
import { createProduct } from "@/lib/actions/products";


export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateProductInput) => {
            const result = await createProduct(data);

            return result;
        },

        onError: (error) => {
            console.log(error)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["products"],
            });
        },
    });
}