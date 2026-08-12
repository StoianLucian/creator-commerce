// lib/data/orders.ts

import "server-only";

import {
    desc,
    eq,
    type BuildQueryResult,
    type ExtractTablesWithRelations,
} from "drizzle-orm";

import { db } from "@/src/db";
import * as schema from "@/src/db/exports";
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
 * The relation tree every order read needs. `as const` keeps the column
 * selection literal so the row type stays narrow.
 *
 * The line itself renders off the snapshot columns on `order_items`; the
 * product join only supplies the thumbnail and a link back to the live
 * listing, both of which are allowed to be missing.
 */
const withLines = {
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
} as const;

type Schema = ExtractTablesWithRelations<typeof schema>;

type OrderWithLines = BuildQueryResult<
    Schema,
    Schema["order"],
    { with: typeof withLines }
>;

/** Row (from either query below) → the shape the order components render. */
function toOrderHistoryEntry(row: OrderWithLines): OrderHistoryEntry {
    return {
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
    };
}

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
        with: withLines,
    });

    return rows.map(toOrderHistoryEntry);
}

/**
 * A single order by its Stripe Checkout Session id, for the post-checkout
 * confirmation page.
 *
 * Not scoped to the signed-in buyer on purpose: guest checkout leaves
 * `buyerId` null, and the session id — only handed back on Stripe's success
 * redirect — is what stands in for proof of purchase.
 */
export async function getOrderByCheckoutSessionId(
    sessionId: string
): Promise<OrderHistoryEntry | null> {
    const row = await db.query.order.findFirst({
        where: eq(order.stripeCheckoutSessionId, sessionId),
        with: withLines,
    });

    return row ? toOrderHistoryEntry(row) : null;
}
