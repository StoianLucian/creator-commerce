"use client";

import { PackageOpen, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useProducts } from '@/hooks/useProducts'
import { useUrlSearch } from '@/hooks/use-url-search';
import ProductCardWrapper from '@/components/products-page/ProductCardWrapper';
import { ProductFilters } from '@/components/products-page/ProductFilters';
import { ProductsPagination } from '@/components/products-page/ProductsPagination';
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
  const { t } = useTranslation();
  const { filters, setFilters, setPage, searchDebounce, resetFilters } = useUrlSearch();
  const { search, sort, minPrice, maxPrice, categoryId, page, pageSize } = filters;

  const { data, isPending } = useProducts({
    q: searchDebounce,
    sort,
    minPrice,
    maxPrice,
    categoryId,
    page,
    pageSize,
  });

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Changing page size goes through setFilters so it resets back to page 1.
  const setPageSize = (next: number) =>
    setFilters((prev) => ({ ...prev, pageSize: next }));

  const hasActiveFilters =
    search.trim() !== "" ||
    minPrice != null ||
    maxPrice != null ||
    categoryId != null;

  const isEmpty = !isPending && products.length === 0;

  return (
    <div className="w-full space-y-6 px-12 py-8">
      <div className={cn("flex flex-col gap-4", products.length === 0 && "col-span-full")}>
        <div className="sticky top-0 z-20 -mx-12 bg-background/95 px-12 py-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <ProductFilters
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </div>

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
                  {t("catalog.noProductsDescExplore")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <ProductCardWrapper products={products} isPending={isPending} />
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
    </div>
  );
}

export default Dashboard
