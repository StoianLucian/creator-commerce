"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SearchFilters } from "@/hooks/use-url-search";
import type { ProductSort, ProductStatusFilter } from "@/hooks/useProducts";

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "most-sold", label: "Most sold" },
];

const statusOptions: { value: ProductStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "deleted", label: "Deleted" },
];

interface PriceRange {
  minPrice?: number;
  maxPrice?: number;
}

function PriceFilter({
  minPrice,
  maxPrice,
  onApply,
}: PriceRange & { onApply: (range: PriceRange) => void }) {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(minPrice != null ? String(minPrice) : "");
  const [max, setMax] = useState(maxPrice != null ? String(maxPrice) : "");

  const hasRange = minPrice != null || maxPrice != null;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setMin(minPrice != null ? String(minPrice) : "");
      setMax(maxPrice != null ? String(maxPrice) : "");
    }
    setOpen(next);
  };

  const apply = () => {
    onApply({
      minPrice: min === "" ? undefined : Math.max(0, Number(min)),
      maxPrice: max === "" ? undefined : Math.max(0, Number(max)),
    });
    setOpen(false);
  };

  const clear = () => {
    setMin("");
    setMax("");
    onApply({ minPrice: undefined, maxPrice: undefined });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={<Button variant="outline" className="h-10 w-full justify-start sm:w-auto" />}
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        {hasRange
          ? `$${minPrice ?? 0} – ${maxPrice != null ? `$${maxPrice}` : "Any"}`
          : "Price"}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72">
        <p className="text-sm font-medium">Price range</p>

        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="min-price" className="text-xs text-muted-foreground">
              Min
            </Label>
            <Input
              id="min-price"
              type="number"
              min="0"
              placeholder="0"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </div>

          <span className="pb-2 text-muted-foreground">–</span>

          <div className="flex-1 space-y-1">
            <Label htmlFor="max-price" className="text-xs text-muted-foreground">
              Max
            </Label>
            <Input
              id="max-price"
              type="number"
              min="0"
              placeholder="Any"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={!hasRange && min === "" && max === ""}
          >
            Clear
          </Button>
          <Button size="sm" onClick={apply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ProductFiltersProps {
  filters: SearchFilters;
  setFilters: Dispatch<SetStateAction<SearchFilters>>;
  resetFilters: () => void;
  searchPlaceholder?: string;
  showStatus?: boolean;
}

export function ProductFilters({
  filters,
  setFilters,
  resetFilters,
  searchPlaceholder = "Search products...",
  showStatus = false,
}: ProductFiltersProps) {
  const { search, sort, minPrice, maxPrice, status } = filters;

  const hasActiveFilters =
    search !== "" ||
    sort !== "newest" ||
    minPrice != null ||
    maxPrice != null ||
    (showStatus && status !== "all");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          aria-label="Search products"
          className="h-10 w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          value={search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
      </div>

      <PriceFilter
        minPrice={minPrice}
        maxPrice={maxPrice}
        onApply={(range) => setFilters((prev) => ({ ...prev, ...range }))}
      />

      {showStatus && (
        <Select
          items={statusOptions}
          value={status}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value as ProductStatusFilter }))
          }
        >
          <SelectTrigger className="h-10 w-full sm:w-44" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        items={sortOptions}
        value={sort}
        onValueChange={(value) => setFilters((prev) => ({ ...prev, sort: value as ProductSort }))}
      >
        <SelectTrigger className="h-10 w-full sm:w-56" aria-label="Sort products">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>

        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" className="h-10 w-full sm:w-auto" onClick={resetFilters}>
          <X className="mr-2 h-4 w-4" />
          Reset filters
        </Button>
      )}
    </div>
  );
}
