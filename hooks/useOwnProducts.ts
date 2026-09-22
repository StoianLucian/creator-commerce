import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteProduct, getOwnnProducts, ProductWithRelations } from "@/lib/actions/products";
import { useProductsProps } from "./useProducts";

export function useOwnProducts({ q, sort = "newest", minPrice, maxPrice, status = "all" }: useProductsProps) {
    return useQuery<ProductWithRelations[], Error>({
        queryKey: ["products-own", q, sort, minPrice, maxPrice, status],
        queryFn: async (): Promise<ProductWithRelations[]> =>
            await getOwnnProducts({ q, sort, minPrice, maxPrice, status })
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: number) => deleteProduct(productId),

        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? "Something went wrong");
                return;
            }

            toast.success("Product deleted");
            // Prefix match refreshes every filter/sort variation of the list.
            queryClient.invalidateQueries({ queryKey: ["products-own"] });
        },

        onError: () => {
            toast.error("Something went wrong");
        },
    });
}
