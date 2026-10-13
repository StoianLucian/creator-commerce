import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteProduct, getOwnnProducts, ProductWithRelations } from "@/lib/actions/products";
import { useProductsProps } from "./useProducts";
import type { Paginated } from "@/lib/products/pagination";
import i18n from "@/i18n/i18n";

export function useOwnProducts({ q, sort = "newest", minPrice, maxPrice, status = "all", categoryId, page = 1, pageSize }: useProductsProps) {
    return useQuery<Paginated<ProductWithRelations>, Error>({
        queryKey: ["products-own", q, sort, minPrice, maxPrice, status, categoryId, page, pageSize],
        queryFn: async (): Promise<Paginated<ProductWithRelations>> =>
            await getOwnnProducts({ q, sort, minPrice, maxPrice, status, categoryId, page, pageSize }),
        // Keep the current page visible while the next one loads.
        placeholderData: keepPreviousData,
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: number) => deleteProduct(productId),

        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? i18n.t("toasts.generic"));
                return;
            }

            toast.success(i18n.t("toasts.productDeleted"));
            // Prefix match refreshes every filter/sort variation of the list.
            queryClient.invalidateQueries({ queryKey: ["products-own"] });
        },

        onError: () => {
            toast.error(i18n.t("toasts.generic"));
        },
    });
}
