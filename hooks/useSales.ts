import { useQuery } from "@tanstack/react-query";

import { fetchMySales } from "@/lib/actions/orders";
import type { SaleEntry } from "@/lib/data/orders";

/** The signed-in creator's paid sales, newest first. */
export function useSales() {
    return useQuery<SaleEntry[], Error>({
        queryKey: ["sales"],
        queryFn: () => fetchMySales(),
    });
}
