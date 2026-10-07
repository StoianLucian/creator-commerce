"use client";

import { PackageOpen, SearchX } from 'lucide-react';

import { useProducts } from '@/hooks/useProducts'
import { useUrlSearch } from '@/hooks/use-url-search';
import ProductCardWrapper from '@/components/products-page/ProductCardWrapper';
import { ProductFilters } from '@/components/products-page/ProductFilters';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Dashboard() {
  const { filters, setFilters, searchDebounce, resetFilters } = useUrlSearch();
  const { search, sort, minPrice, maxPrice, categoryId } = filters;

  const { data: products = [], isPending } = useProducts({
    q: searchDebounce,
    sort,
    minPrice,
    maxPrice,
    categoryId,
  });

  const hasActiveFilters =
    search.trim() !== "" ||
    minPrice != null ||
    maxPrice != null ||
    categoryId != null;

  const isEmpty = !isPending && products.length === 0;

  return (
    <div className="w-full space-y-6 px-12 py-8">
      <div className={cn("flex flex-col gap-4", products.length === 0 && "col-span-full")}>
        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
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
                  Check back soon — new products from creators will show up here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ProductCardWrapper products={products} isPending={isPending} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard
