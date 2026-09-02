"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateProductInput } from "@/form-validations/products";
import { updateProduct } from "@/lib/actions/products";
import { toast } from "sonner";

export function useUpdateProduct(id: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductInput) => updateProduct(id, data),

        onError: () => {
            toast.error("Error updating the product!");
        },
        onSuccess: () => {
            toast.success("Product updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["products-own"] });
        },
    });
}
