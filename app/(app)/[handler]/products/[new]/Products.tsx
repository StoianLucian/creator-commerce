"use client";

import { PackageOpen, SearchX } from "lucide-react";

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
import { useOwnProducts } from "@/hooks/useOwnProducts";

function Products() {
    const { filters, setFilters, searchDebounce, resetFilters } = useUrlSearch();

    const { search, sort, minPrice, maxPrice, status, categoryId } = filters;
    const { data: products = [], isPending, isError, error } = useOwnProducts({
        q: searchDebounce,
        sort,
        minPrice,
        maxPrice,
        status,
        categoryId,
    });

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
                    Could not load your products
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
                searchPlaceholder="Search your products..."
                showStatus
            />
            {isEmpty ? (
                hasActiveFilters ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <SearchX />
                            </EmptyMedia>
                            <EmptyTitle>No products match your filters</EmptyTitle>
                            <EmptyDescription>
                                Try adjusting or clearing your filters to see more.
                            </EmptyDescription>
                        </EmptyHeader>

                        <Button variant="outline" size="sm" onClick={resetFilters}>
                            Clear filters
                        </Button>
                    </Empty>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <PackageOpen />
                            </EmptyMedia>
                            <EmptyTitle>No products yet</EmptyTitle>
                            <EmptyDescription>
                                Add your first product with the New Product button above.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <ProductCardWrapper products={products} isPending={isPending} editable />
                </div>
            )}
        </div>
    );
}

export default Products;
