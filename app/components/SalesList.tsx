"use client";

import { ChartColumn, TrendingUp } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { SaleCard } from "@/components/sales/SaleCard";
import { useSales } from "@/hooks/useSales";
import { priceFormatter } from "@/lib/format";
import { ChartContainer } from "@/components/ui/chart";
import { MyChart } from "./ChartTest";

/** Amounts on an order are cents; prices elsewhere are whole dollars. */
const fromCents = (cents: number) => priceFormatter.format(cents / 100);

function SalesList() {
  const { data: sales = [], isPending, isError, error } = useSales();


  const revenueByDay = [
    ...sales
      .reduce((byDay, sale) => {
        // `YYYY-MM-DD` in UTC, matching `dateFormatter`'s fixed timezone.
        const date = sale.createdAt.toISOString().slice(0, 10);

        return byDay.set(date, (byDay.get(date) ?? 0) + sale.total);
      }, new Map<string, number>())
      .entries(),
  ]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, cents]) => ({ date, revenue: cents / 100 }));

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6">
        <p className="font-medium text-destructive">Could not load your sales</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-lg" />
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrendingUp />
          </EmptyMedia>
          <EmptyTitle>No sales yet</EmptyTitle>
          <EmptyDescription>
            When someone buys one of your products, the order shows up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const revenue = sales.reduce((total, sale) => total + sale.total, 0);
  const unitsSold = sales.reduce((total, sale) => total + sale.itemCount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border p-4">
        <div>
          <p className="text-sm text-muted-foreground">Total revenue</p>
          <p className="text-2xl font-bold">{fromCents(revenue)}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {unitsSold} item{unitsSold === 1 ? "" : "s"} across {sales.length}{" "}
          order{sales.length === 1 ? "" : "s"}
        </p>
      </div>
      <MyChart data={revenueByDay} />
      <ul className="space-y-4">
        {sales.map((sale) => (
          <SaleCard key={sale.id} sale={sale} />
        ))}
      </ul>
    </div>
  );
}

export default SalesList;
