"use client";

import { cn } from "@/lib/utils";
import { useUrlSearch } from "@/hooks/use-url-search";
import ProductCardWrapper from "@/components/products-page/ProductCardWrapper";
import { ProductFilters } from "@/components/products-page/ProductFilters";
import { useOwnProducts } from "@/hooks/useOwnProducts";

function Products() {
    const { filters, setFilters, searchDebounce, resetFilters } = useUrlSearch();

    const { sort, minPrice, maxPrice, status } = filters;
    const { data: products = [], isPending, isError, error } = useOwnProducts({
        q: searchDebounce,
        sort,
        minPrice,
        maxPrice,
        status,
    });

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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ProductCardWrapper products={products} isPending={isPending} editable />
            </div>
        </div>
    );
}

export default Products;
