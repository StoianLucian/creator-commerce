// hooks/useCategories.ts
import { getCategories } from "@/lib/data/categories";
import { useQuery } from "@tanstack/react-query";


export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories(),
    });
}