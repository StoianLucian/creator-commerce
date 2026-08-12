// lib/data/orders.ts

import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/src/db";
import { order, type OrderStatus } from "@/src/db/order-schema";
import { CreatorPaths } from "@/enums/AppPaths";
import { getSession } from "@/lib/session";

export type OrderHistoryLine = {
    id: number;
    /** Snapshot from purchase time, not the live product name. */
    name: string;
    quantity: number;
    /** Cents — see `order_items` in the schema. */
    unitPrice: number;
    lineTotal: number;
    /** From the live product, so a removed product just loses its thumbnail. */
    imageUrl: string | null;
    /** Null when the product (or its owner) is gone — nothing to link to. */
    href: string | null;
};

export type OrderHistoryEntry = {
    id: number;
    status: OrderStatus;
    /** Cents. */
    subtotal: number;
    createdAt: Date;
    itemCount: number;
    lines: OrderHistoryLine[];
};

/**
 * The signed-in buyer's orders, newest first, with their line items.
 *
 * Returns an empty list for guests rather than throwing — the page guards
 * the route, this just doesn't assume it. Only orders tied to the account
 * are returned: a guest checkout has no `buyerId`, so it can't be claimed
 * by signing up with the same email later.
 */
export async function getMyOrders(): Promise<OrderHistoryEntry[]> {
    const session = await getSession();

    if (!session) return [];

    const rows = await db.query.order.findMany({
        where: eq(order.buyerId, session.user.id),
        orderBy: desc(order.createdAt),
        with: {
            items: {
                with: {
                    product: {
                        columns: { id: true, slug: true },
                        with: {
                            images: { limit: 1 },
                            owner: { columns: { username: true } },
                        },
                    },
                },
            },
        },
    });

    return rows.map((row) => ({
        id: row.id,
        status: row.status as OrderStatus,
        subtotal: row.subtotal,
        createdAt: row.createdAt,
        itemCount: row.items.reduce((total, item) => total + item.quantity, 0),
        lines: row.items.map((item) => {
            const username = item.product?.owner?.username;

            return {
                id: item.id,
                name: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
                imageUrl: item.product?.images[0]?.imageUrl ?? null,
                href:
                    item.product && username
                        ? CreatorPaths.product(
                              username,
                              item.product.id,
                              item.product.slug
                          )
                        : null,
            };
        }),
    }));
}
