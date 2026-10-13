import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "./useDebounce";
import { ProductSort, ProductStatusFilter } from "./useProducts";
import { PRODUCTS_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/products/pagination";

const DEFAULT_SORT: ProductSort = "newest";
const DEFAULT_STATUS: ProductStatusFilter = "all";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = PRODUCTS_PAGE_SIZE;
const SORT_PARAM = "sort";
const MIN_PARAM = "minPrice";
const MAX_PARAM = "maxPrice";
const STATUS_PARAM = "status";
const CATEGORY_PARAM = "category";
const PAGE_PARAM = "page";
const PAGE_SIZE_PARAM = "pageSize";

export type SearchFilters = {
    search: string;
    sort: ProductSort;
    minPrice?: number;
    maxPrice?: number;
    status: ProductStatusFilter;
    categoryId?: number;
    page: number;
    pageSize: number;
};

function parsePageParam(value: string | null) {
    if (!value) return DEFAULT_PAGE;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
}

function parsePageSizeParam(value: string | null) {
    if (!value) return DEFAULT_PAGE_SIZE;
    const parsed = Number(value);
    // Only honour sizes we actually offer, so a hand-edited URL can't request
    // an arbitrarily large page.
    return (PAGE_SIZE_OPTIONS as readonly number[]).includes(parsed)
        ? parsed
        : DEFAULT_PAGE_SIZE;
}

function parsePriceParam(value: string | null) {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseCategoryParam(value: string | null) {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function useUrlSearch(
    param = "q",
    debounceMs = 300,
) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [filters, setFiltersState] = useState<SearchFilters>({
        search: searchParams.get(param) ?? "",
        sort: (searchParams.get(SORT_PARAM) as ProductSort) ?? DEFAULT_SORT,
        minPrice: parsePriceParam(searchParams.get(MIN_PARAM)),
        maxPrice: parsePriceParam(searchParams.get(MAX_PARAM)),
        status: (searchParams.get(STATUS_PARAM) as ProductStatusFilter) ?? DEFAULT_STATUS,
        categoryId: parseCategoryParam(searchParams.get(CATEGORY_PARAM)),
        page: parsePageParam(searchParams.get(PAGE_PARAM)),
        pageSize: parsePageSizeParam(searchParams.get(PAGE_SIZE_PARAM)),
    });

    // Any change to a *filter* resets back to page 1 — a result set narrowed by
    // a new search/sort/category rarely has the page you were on. Page changes
    // go through `setPage`, which leaves the other filters untouched.
    const setFilters: Dispatch<SetStateAction<SearchFilters>> = (update) => {
        setFiltersState((prev) => {
            const next = typeof update === "function" ? update(prev) : update;
            return { ...next, page: DEFAULT_PAGE };
        });
    };

    const setPage = (page: number) =>
        setFiltersState((prev) => ({ ...prev, page }));

    const searchDebounce = useDebounce(filters.search, debounceMs);

    useEffect(() => {
        // Desired value for each param, with "" meaning "drop it from the URL"
        // (defaults are left out so clean URLs stay clean).
        const desired: Record<string, string> = {
            [param]: searchDebounce.trim(),
            [SORT_PARAM]: filters.sort !== DEFAULT_SORT ? filters.sort : "",
            [MIN_PARAM]: filters.minPrice != null ? String(filters.minPrice) : "",
            [MAX_PARAM]: filters.maxPrice != null ? String(filters.maxPrice) : "",
            [STATUS_PARAM]: filters.status !== DEFAULT_STATUS ? filters.status : "",
            [CATEGORY_PARAM]: filters.categoryId != null ? String(filters.categoryId) : "",
            [PAGE_PARAM]: filters.page !== DEFAULT_PAGE ? String(filters.page) : "",
            [PAGE_SIZE_PARAM]:
                filters.pageSize !== DEFAULT_PAGE_SIZE ? String(filters.pageSize) : "",
        };

        const params = new URLSearchParams(searchParams.toString());
        let changed = false;

        for (const [key, value] of Object.entries(desired)) {
            if ((searchParams.get(key) ?? "") === value) continue;
            changed = true;
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        }

        // Nothing to write — bail so we don't loop on our own URL update.
        if (!changed) return;

        router.replace(`${pathname}?${params.toString()}`, {
            scroll: false,
        });
    }, [
        searchDebounce,
        filters.sort,
        filters.minPrice,
        filters.maxPrice,
        filters.status,
        filters.categoryId,
        filters.page,
        filters.pageSize,
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
            status: DEFAULT_STATUS,
            categoryId: undefined,
            page: DEFAULT_PAGE,
            pageSize: DEFAULT_PAGE_SIZE,
        });

    return {
        filters,
        setFilters,
        setPage,
        searchDebounce,
        resetFilters,
    };
}
