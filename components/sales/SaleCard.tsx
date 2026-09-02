import Link from "next/link";
import { Package } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { SaleEntry } from "@/lib/data/orders";
import { dateFormatter, priceFormatter } from "@/lib/format";

/** Amounts on an order are cents; prices elsewhere are whole dollars. */
const fromCents = (cents: number) => priceFormatter.format(cents / 100);

/** The seller's view of one order — only their own lines. See `getMySales`. */
export function SaleCard({ sale }: { sale: SaleEntry }) {
    return (
        <li className="rounded-xl border bg-card text-card-foreground shadow-sm transition hover:border-foreground/20 hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold">Order #{sale.id}</h2>
                        <OrderStatusBadge status={sale.status} />
                    </div>

                    <p className="text-sm text-muted-foreground">
                        <time dateTime={sale.createdAt.toISOString()}>
                            {dateFormatter.format(sale.createdAt)}
                        </time>
                        {" · "}
                        {sale.itemCount} item{sale.itemCount === 1 ? "" : "s"}
                        {sale.buyerEmail ? ` · ${sale.buyerEmail}` : ""}
                    </p>
                </div>

                <span className="font-semibold tabular-nums">{fromCents(sale.total)}</span>
            </div>

            <Separator />

            <ul className="divide-y">
                {sale.lines.map((line) => (
                    <li key={line.id} className="flex items-center gap-3 p-4">
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
                                    className="block truncate font-medium hover:underline"
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
