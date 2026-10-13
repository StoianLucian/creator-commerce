"use client";

import Link from "next/link";
import { Heart, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useWishlist, useWishlistIds } from "@/hooks/useWishlist";
import { useUrlSearch } from "@/hooks/use-url-search";
import ProductCardWrapper from "@/components/products-page/ProductCardWrapper";
import { ProductFilters } from "@/components/products-page/ProductFilters";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AppPaths } from "@/enums/AppPaths";

function Wishlist() {
  const { t } = useTranslation();
  const { filters, setFilters, searchDebounce, resetFilters } = useUrlSearch();
  const { sort, minPrice, maxPrice, categoryId } = filters;

  // The ids tell us whether anything is saved at all, independent of the
  // active filters — so we can tell "empty wishlist" apart from "nothing
  // matches your filters".
  const { data: ids = [] } = useWishlistIds();
  const hasSaved = ids.length > 0;

  const { data: products = [], isPending } = useWishlist({
    q: searchDebounce,
    sort,
    minPrice,
    maxPrice,
    categoryId,
  });

  const isWishlistEmpty = !hasSaved;
  const noMatches = hasSaved && !isPending && products.length === 0;

  return (
    <div className="w-full space-y-6 px-12 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t("wishlist.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("wishlist.subtitle")}
        </p>
      </div>

      {isWishlistEmpty ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Heart />
            </EmptyMedia>
            <EmptyTitle>{t("wishlist.emptyTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("wishlist.emptyDesc")}
            </EmptyDescription>
          </EmptyHeader>

          <Button
            render={<Link href={AppPaths.DASHBOARD} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            {t("wishlist.explore")}
          </Button>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="sticky top-0 z-20 -mx-12 bg-background/95 px-12 py-4 backdrop-blur supports-backdrop-filter:bg-background/60">
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              resetFilters={resetFilters}
              searchPlaceholder={t("wishlist.searchPlaceholder")}
            />
          </div>

          {noMatches ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>{t("wishlist.noMatchTitle")}</EmptyTitle>
                <EmptyDescription>
                  {t("wishlist.noMatchDesc")}
                </EmptyDescription>
              </EmptyHeader>

              <Button variant="outline" size="sm" onClick={resetFilters}>
                {t("filters.resetFilters")}
              </Button>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <ProductCardWrapper products={products} isPending={isPending} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
