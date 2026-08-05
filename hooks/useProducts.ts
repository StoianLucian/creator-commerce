import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/lib/actions/products";
import type { Product } from "@/src/db/product-schema";

export function useProducts() {
    return useQuery<Product[], Error>({
        queryKey: ["products"],
        queryFn: async (): Promise<Product[]> => await getProducts()
    });
}