"use client";

import { PackageOpen, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { useUrlSearch } from "@/hooks/use-url-search";
import ProductCardWrapper from "@/components/products-page/ProductCardWrapper";
import { ProductFilters } from "@/components/products-page/ProductFilters";
import { ProductsPagination } from "@/components/products-page/ProductsPagination";
import { useOwnProducts } from "@/hooks/useOwnProducts";

function Products() {
    const { t } = useTranslation();
    const { filters, setFilters, setPage, searchDebounce, resetFilters } = useUrlSearch();

    const { search, sort, minPrice, maxPrice, status, categoryId, page, pageSize } = filters;
    const { data, isPending, isError, error } = useOwnProducts({
        q: searchDebounce,
        sort,
        minPrice,
        maxPrice,
        status,
        categoryId,
        page,
        pageSize,
    });

    const products = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    // Changing page size goes through setFilters so it resets back to page 1.
    const setPageSize = (next: number) =>
        setFilters((prev) => ({ ...prev, pageSize: next }));

    // A filtered-empty result (no matches) is different from a brand-new seller
    // with no catalog — show the right message, and only offer "Clear filters"
    // when something is actually narrowing the list.
    const hasActiveFilters =
        search.trim() !== "" ||
        minPrice != null ||
        maxPrice != null ||
        status !== "all" ||
        categoryId != null;

    const isEmpty = !isPending && !isError && products.length === 0;

    if (isError) {
        return (
            <div className="col-span-full rounded-xl border border-destructive/50 bg-destructive/5 p-6">
                <p className="font-medium text-destructive">
                    {t("catalog.loadError")}
                </p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-4", products.length === 0 && "col-span-full")}>
            <ProductFilters
                filters={filters}
                setFilters={setFilters}
                resetFilters={resetFilters}
                searchPlaceholder={t("filters.searchYourProducts")}
                showStatus
            />
            {isEmpty ? (
                hasActiveFilters ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <SearchX />
                            </EmptyMedia>
                            <EmptyTitle>{t("catalog.noMatchTitle")}</EmptyTitle>
                            <EmptyDescription>
                                {t("catalog.noMatchDesc")}
                            </EmptyDescription>
                        </EmptyHeader>

                        <Button variant="outline" size="sm" onClick={resetFilters}>
                            {t("catalog.clearFilters")}
                        </Button>
                    </Empty>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <PackageOpen />
                            </EmptyMedia>
                            <EmptyTitle>{t("catalog.noProductsTitle")}</EmptyTitle>
                            <EmptyDescription>
                                {t("catalog.noProductsDescOwner")}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <ProductCardWrapper products={products} isPending={isPending} editable />
                    </div>
                    <ProductsPagination
                        page={page}
                        pageSize={pageSize}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        className="pt-2"
                    />
                </>
            )}
        </div>
    );
}

export default Products;
