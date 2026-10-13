import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProducts, ProductWithRelations } from "@/lib/actions/products";
import type { Paginated } from "@/lib/products/pagination";

export type ProductSort = "newest" | "price-asc" | "price-desc" | "most-sold";

export type ProductStatusFilter = "all" | "active" | "draft" | "sold" | "deleted";

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
    status?: ProductStatusFilter,
    categoryId?: number,
    page?: number,
    pageSize?: number,
}

export function useProducts({ q, sort = "newest", minPrice, maxPrice, categoryId, page = 1, pageSize }: useProductsProps) {
    return useQuery<Paginated<ProductWithRelations>, Error>({
        queryKey: ["products", q, sort, minPrice, maxPrice, categoryId, page, pageSize],
        queryFn: async (): Promise<Paginated<ProductWithRelations>> =>
            await getProducts({ q, sort, minPrice, maxPrice, categoryId, page, pageSize }),
        // Keep the current page on screen while the next one loads, so the grid
        // doesn't flash the empty/loading state on every page change.
        placeholderData: keepPreviousData,
    });
}