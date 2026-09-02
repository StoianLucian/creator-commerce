import { useQuery } from "@tanstack/react-query";
import { getProducts, ProductWithRelations } from "@/lib/actions/products";

export type ProductSort = "newest" | "price-asc" | "price-desc" | "most-sold";

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


export type useProductsProps = {
    q: string,
    sort?: ProductSort,
    minPrice?: number,
    maxPrice?: number,
}

export function useProducts({ q, sort = "newest", minPrice, maxPrice }: useProductsProps) {
    return useQuery<ProductWithRelations[], Error>({
        queryKey: ["products", q, sort, minPrice, maxPrice],
        queryFn: async (): Promise<ProductWithRelations[]> =>
            await getProducts({ q, sort, minPrice, maxPrice })
    });
}