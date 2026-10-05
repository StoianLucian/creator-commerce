"use client";

import Link from "next/link";
import { Heart, SearchX } from "lucide-react";

import { useWishlist, useWishlistIds } from "@/hooks/useWishlist";
import { useUrlSearch } from "@/hooks/use-url-search";
import ProductCardWrapper from "@/components/products-page/ProductCardWrapper";
import { ProductFilters } from "@/components/products-page/ProductFilters";
import { Button } from "@/components/ui/button";
import { AppPaths } from "@/enums/AppPaths";

function Wishlist() {
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
        <h1 className="text-2xl font-semibold">Wishlist</h1>
        <p className="text-sm text-muted-foreground">
          Products you&apos;ve saved for later.
        </p>
      </div>

      {isWishlistEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Heart className="h-8 w-8 text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="font-medium">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground">
              Tap the heart on any product to save it here.
            </p>
          </div>
          <Button
            render={<Link href={AppPaths.DASHBOARD} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Explore products
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ProductFilters
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            searchPlaceholder="Search your wishlist..."
          />

          {noMatches ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
              <SearchX className="h-8 w-8 text-muted-foreground/50" />
              <div className="space-y-1">
                <p className="font-medium">No saved products match your filters</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting or resetting your filters.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
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
