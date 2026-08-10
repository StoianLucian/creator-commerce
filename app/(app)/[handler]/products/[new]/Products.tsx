"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUrlSearch } from "@/hooks/use-url-search";
import ProductCardWrapper from "@/components/products-page/ProductCardWrapper";
import { useOwnProducts } from "@/hooks/useOwnProducts";

function Products() {
    const { filters, setFilters, searchDebounce } = useUrlSearch();

    const { search } = filters;
    const { data: products = [], isPending, isError, error } = useOwnProducts({ q: searchDebounce });

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
            <div>
                <Search className="relative left-3 top-7 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary"
                    value={search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ProductCardWrapper products={products} isPending={isPending} />
            </div>
        </div>
    );
}

export default Products;
