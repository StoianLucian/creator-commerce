"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateProductInput } from "@/form-validations/products";
import { createProduct } from "@/lib/actions/products";
import { toast } from "sonner";


export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductInput) => createProduct(data),

        onError: () => {
            toast.error("Error creating the product!");
        },
        onSuccess: () => {
            toast.success("Product created successfully!");
            queryClient.invalidateQueries({
                queryKey: ["products"],
            });
        },
    });
}