import Link from "next/link";
import { Package } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import type { OrderHistoryEntry } from "@/lib/data/orders";
import { dateFormatter, priceFormatter } from "@/lib/format";
import { OrderStatusBadge } from "./OrderStatusBadge";

/** Amounts on an order are cents; prices elsewhere are whole dollars. */
const fromCents = (cents: number) => priceFormatter.format(cents / 100);

export function OrderCard({ entry }: { entry: OrderHistoryEntry }) {
    return (
        <li className="rounded-lg border">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="font-medium">Order #{entry.id}</h2>
                        <OrderStatusBadge status={entry.status} />
                    </div>

                    <p className="text-sm text-muted-foreground">
                        <time dateTime={entry.createdAt.toISOString()}>
                            {dateFormatter.format(entry.createdAt)}
                        </time>
                        {" · "}
                        {entry.itemCount} item{entry.itemCount === 1 ? "" : "s"}
                    </p>
                </div>

                <span className="font-semibold">{fromCents(entry.subtotal)}</span>
            </div>

            <Separator />

            <ul className="divide-y">
                {entry.lines.map((line) => (
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

                            <p className="text-sm text-muted-foreground">
                                {fromCents(line.unitPrice)} × {line.quantity}
                            </p>
                        </div>

                        <span className="shrink-0 font-medium">
                            {fromCents(line.lineTotal)}
                        </span>
                    </li>
                ))}
            </ul>
        </li>
    );
}
