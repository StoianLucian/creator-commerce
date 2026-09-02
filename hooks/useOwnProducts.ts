import { useQuery } from "@tanstack/react-query";
import { getOwnnProducts, ProductWithRelations } from "@/lib/actions/products";
import { useProductsProps } from "./useProducts";

export function useOwnProducts({ q, sort = "newest", minPrice, maxPrice }: useProductsProps) {
    return useQuery<ProductWithRelations[], Error>({
        queryKey: ["products-own", q, sort, minPrice, maxPrice],
        queryFn: async (): Promise<ProductWithRelations[]> =>
            await getOwnnProducts({ q, sort, minPrice, maxPrice })
    });
}
