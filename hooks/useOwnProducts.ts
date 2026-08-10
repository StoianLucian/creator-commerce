import { useQuery } from "@tanstack/react-query";
import { getOwnnProducts, ProductWithRelations } from "@/lib/actions/products";

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
}

export function useOwnProducts({ q }: useProductsProps) {
    return useQuery<ProductWithRelations[], Error>({
        queryKey: ["products-own", q],
        queryFn: async (): Promise<ProductWithRelations[]> => await getOwnnProducts({ q })
    });
}