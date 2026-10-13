"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Separator } from "@/components/ui/separator";
import type { OrderHistoryEntry } from "@/lib/data/orders";
import { dateFormatter, priceFormatter } from "@/lib/format";
import { OrderStatusBadge } from "./OrderStatusBadge";

/** Amounts on an order are the minor unit (bani); prices elsewhere are whole lei. */
const fromCents = (cents: number) => priceFormatter.format(cents / 100);

export function OrderCard({ entry }: { entry: OrderHistoryEntry }) {
    const { t } = useTranslation();

    return (
        <li className="rounded-xl border bg-card text-card-foreground shadow-sm transition hover:border-foreground/20 hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold">{t("orders.orderNumber", { id: entry.id })}</h2>
                        <OrderStatusBadge status={entry.status} />
                    </div>

                    <p className="text-sm text-muted-foreground">
                        <time dateTime={entry.createdAt.toISOString()}>
                            {dateFormatter.format(entry.createdAt)}
                        </time>
                        {" · "}
                        {t("orders.items", { count: entry.itemCount })}
                    </p>
                </div>

                <span className="font-semibold tabular-nums">
                    {fromCents(entry.subtotal)}
                </span>
            </div>

            <Separator />

            <ul className="divide-y">
                {entry.lines.map((line) => (
                    <li
                        key={line.id}
                        className="flex items-center gap-4 p-4 sm:px-6"
                    >
                        {line.imageUrl ? (
                            <img
                                src={line.imageUrl}
                                alt={line.name}
                                className="h-12 w-12 shrink-0 rounded-lg border object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted">
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            {line.href ? (
                                <Link
                                    href={line.href}
                                    className="block truncate rounded-sm font-medium transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {line.name}
                                </Link>
                            ) : (
                                <p className="truncate font-medium">{line.name}</p>
                            )}

                            <p className="text-sm text-muted-foreground tabular-nums">
                                {fromCents(line.unitPrice)} × {line.quantity}
                            </p>
                        </div>

                        <span className="shrink-0 font-medium tabular-nums">
                            {fromCents(line.lineTotal)}
                        </span>
                    </li>
                ))}
            </ul>
        </li>
    );
}
