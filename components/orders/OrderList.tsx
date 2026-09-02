"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { OrderHistoryEntry } from "@/lib/data/orders";
import { OrderCard } from "./OrderCard";

export function OrderList({ orders }: { orders: OrderHistoryEntry[] }) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return orders;

        return orders.filter((order) => {
            const haystack = [
                `#${order.id}`,
                String(order.id),
                order.status,
                ...order.lines.map((line) => line.name),
            ]
                .join(" ")
                .toLowerCase();

            return haystack.includes(q);
        });
    }, [orders, query]);

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by order number, product, or status..."
                    aria-label="Search orders"
                    className="h-10 w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                />
            </div>

            {filtered.length === 0 ? (
                <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No orders match &ldquo;{query.trim()}&rdquo;.
                </p>
            ) : (
                <ul className="space-y-4">
                    {filtered.map((entry) => (
                        <OrderCard key={entry.id} entry={entry} />
                    ))}
                </ul>
            )}
        </div>
    );
}
