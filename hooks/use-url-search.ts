import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "./useDebounce";
import { fi, se } from "date-fns/locale";

export function useUrlSearch(
    param = "q",
    debounceMs = 300,
) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [filters, setFilters] = useState(
        { search: searchParams.get(param) ?? "" }
    );

    const searchDebounce = useDebounce(filters.search, debounceMs);

    useEffect(() => {
        const currentQuery = searchParams.get(param) ?? "";
        const nextQuery = searchDebounce.trim();

        if (currentQuery === nextQuery) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());

        if (nextQuery) {
            params.set(param, nextQuery);
        } else {
            params.delete(param);
        }

        router.replace(`${pathname}?${params.toString()}`, {
            scroll: false,
        });
    }, [
        searchDebounce,
        searchParams,
        router,
        pathname,
        param,
    ]);

    return {
        filters,
        setFilters,
        searchDebounce,
    };
}