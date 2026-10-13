"use client";

import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

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
import { MyChart } from "./ChartTest";

/** Amounts on an order are the minor unit (bani); prices elsewhere are whole lei. */
const fromCents = (cents: number) => priceFormatter.format(cents / 100);

function SalesList() {
  const { t } = useTranslation();
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
        <p className="font-medium text-destructive">{t("sales.loadError")}</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
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
          <EmptyTitle>{t("sales.emptyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("sales.emptyDesc")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const revenue = sales.reduce((total, sale) => total + sale.total, 0);
  const unitsSold = sales.reduce((total, sale) => total + sale.itemCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t("sales.totalRevenue")}</p>
          <p className="text-3xl font-semibold tabular-nums">{fromCents(revenue)}</p>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {t("sales.summary", {
            count: sales.length,
            items: t("sales.items", { count: unitsSold }),
          })}
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
