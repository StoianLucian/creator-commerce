"use client";

import { useProducts } from '@/hooks/useProducts'
import { useUrlSearch } from '@/hooks/use-url-search';
import ProductCardWrapper from '@/components/products-page/ProductCardWrapper';
import { ProductFilters } from '@/components/products-page/ProductFilters';
import { cn } from '@/lib/utils';

function Dashboard() {
  const { filters, setFilters, searchDebounce, resetFilters } = useUrlSearch();
  const { sort, minPrice, maxPrice } = filters;

  const { data: products = [], isPending } = useProducts({
    q: searchDebounce,
    sort,
    minPrice,
    maxPrice,
  });

  return (
    <div className="w-full space-y-6 px-12 py-8">
      <div className={cn("flex flex-col gap-4", products.length === 0 && "col-span-full")}>
        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ProductCardWrapper products={products} isPending={isPending} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard
