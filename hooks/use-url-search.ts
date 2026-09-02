import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "./useDebounce";
import { ProductSort } from "./useProducts";

const DEFAULT_SORT: ProductSort = "newest";
const SORT_PARAM = "sort";
const MIN_PARAM = "minPrice";
const MAX_PARAM = "maxPrice";

export type SearchFilters = {
    search: string;
    sort: ProductSort;
    minPrice?: number;
    maxPrice?: number;
};

function parsePriceParam(value: string | null) {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function useUrlSearch(
    param = "q",
    debounceMs = 300,
) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [filters, setFilters] = useState<SearchFilters>({
        search: searchParams.get(param) ?? "",
        sort: (searchParams.get(SORT_PARAM) as ProductSort) ?? DEFAULT_SORT,
        minPrice: parsePriceParam(searchParams.get(MIN_PARAM)),
        maxPrice: parsePriceParam(searchParams.get(MAX_PARAM)),
    });

    const searchDebounce = useDebounce(filters.search, debounceMs);

    useEffect(() => {
        const currentQuery = searchParams.get(param) ?? "";
        const currentSort =
            (searchParams.get(SORT_PARAM) as ProductSort) ?? DEFAULT_SORT;
        const currentMin = searchParams.get(MIN_PARAM) ?? "";
        const currentMax = searchParams.get(MAX_PARAM) ?? "";

        const nextQuery = searchDebounce.trim();
        const nextSort = filters.sort;
        const nextMin = filters.minPrice != null ? String(filters.minPrice) : "";
        const nextMax = filters.maxPrice != null ? String(filters.maxPrice) : "";

        if (
            currentQuery === nextQuery &&
            currentSort === nextSort &&
            currentMin === nextMin &&
            currentMax === nextMax
        ) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());

        if (nextQuery) {
            params.set(param, nextQuery);
        } else {
            params.delete(param);
        }

        if (nextSort !== DEFAULT_SORT) {
            params.set(SORT_PARAM, nextSort);
        } else {
            params.delete(SORT_PARAM);
        }

        if (nextMin) {
            params.set(MIN_PARAM, nextMin);
        } else {
            params.delete(MIN_PARAM);
        }

        if (nextMax) {
            params.set(MAX_PARAM, nextMax);
        } else {
            params.delete(MAX_PARAM);
        }

        router.replace(`${pathname}?${params.toString()}`, {
            scroll: false,
        });
    }, [
        searchDebounce,
        filters.sort,
        filters.minPrice,
        filters.maxPrice,
        searchParams,
        router,
        pathname,
        param,
    ]);

    const resetFilters = () =>
        setFilters({
            search: "",
            sort: DEFAULT_SORT,
            minPrice: undefined,
            maxPrice: undefined,
        });

    return {
        filters,
        setFilters,
        searchDebounce,
        resetFilters,
    };
}
