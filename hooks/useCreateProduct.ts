"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateProductInput } from "@/form-validations/products";
import { createProduct } from "@/lib/actions/products";
import { toast } from "sonner";


export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateProductInput) => {
            const result = await createProduct(data);

            return result;
        },

        onError: (error) => {
            toast.error("Error creating the product!");
        },
        onSuccess: (success) => {
            toast.success("Product created successfully!");
            queryClient.invalidateQueries({
                queryKey: ["products"],
            });
        },
    });
}