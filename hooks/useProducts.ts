import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/lib/actions/products";

export type Product = {
    id: number;
    name: string;
    description: string | null;
    created_at: Date | null;
    ownerId: string;
    categoryId: number;
    status: string;
    slug: string;
    sold: number;
    price: number;
    images: {
        id: number;
        productId: number;
        imageUrl: string;
        imageKey: string;
    }[];
}

export function useProducts(q: string) {
    return useQuery<Product[], Error>({
        queryKey: ["products", q],
        queryFn: async (): Promise<Product[]> => await getProducts(q)
    });
}