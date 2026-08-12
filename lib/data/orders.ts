// lib/data/orders.ts

import "server-only";

import {
    and,
    desc,
    eq,
    inArray,
    type BuildQueryResult,
    type ExtractTablesWithRelations,
} from "drizzle-orm";

import { db } from "@/src/db";
import * as schema from "@/src/db/exports";
import { order, orderItem, type OrderStatus } from "@/src/db/order-schema";
import { product } from "@/src/db/product-schema";
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
 * A sale as the selling creator sees it: one order, narrowed to the lines
 * for their own products. See `getMySales`.
 */
export type SaleEntry = {
    id: number;
    status: OrderStatus;
    createdAt: Date;
    /** Null until Stripe reports it back on the checkout webhook. */
    buyerEmail: string | null;
    /** Cents. This creator's share of the order, not `order.subtotal`. */
    total: number;
    /** Units sold by this creator on the order. */
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
 *
 * `ownerId` is here for `getMySales`, which uses it to keep a creator to
 * their own lines of a shared order.
 */
const withLines = {
    items: {
        with: {
            product: {
                columns: { id: true, slug: true, ownerId: true },
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

type OrderItemWithProduct = OrderWithLines["items"][number];

/** One `order_items` row → the shape the line components render. */
function toOrderHistoryLine(item: OrderItemWithProduct): OrderHistoryLine {
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
}

/** Row (from either query below) → the shape the order components render. */
function toOrderHistoryEntry(row: OrderWithLines): OrderHistoryEntry {
    return {
        id: row.id,
        status: row.status as OrderStatus,
        subtotal: row.subtotal,
        createdAt: row.createdAt,
        itemCount: row.items.reduce((total, item) => total + item.quantity, 0),
        lines: row.items.map(toOrderHistoryLine),
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

/**
 * The other side of an order: what the signed-in creator has *sold*.
 *
 * One entry per paid order that contains at least one of their products,
 * newest first. Only `pending`/`failed` orders are left out — an order row
 * exists before Stripe confirms payment, so counting those would inflate
 * the revenue total.
 *
 * Lines are narrowed to the creator's own products, so an order spanning
 * two creators shows each of them only their half — including `total`,
 * which is this creator's share and not `order.subtotal`.
 */
export async function getMySales(): Promise<SaleEntry[]> {


    try {
        const session = await getSession();

        if (!session) return []
        const ownerId = session.user.id;

        // Two steps because the relational query below filters orders, not the
        // lines inside them: this picks the orders, `withLines` then loads each
        // one whole and the map drops the lines belonging to other creators.
        const myProducts = db
            .select({ id: product.id })
            .from(product)
            .where(eq(product.ownerId, ownerId));

        const matches = await db
            .selectDistinct({ orderId: orderItem.orderId })
            .from(orderItem)
            .innerJoin(order, eq(orderItem.orderId, order.id))
            .where(
                and(
                    eq(order.status, "paid"),
                    inArray(orderItem.productId, myProducts)
                )
            );

        if (matches.length === 0) return [];

        const rows = await db.query.order.findMany({
            where: inArray(
                order.id,
                matches.map((match) => match.orderId)
            ),
            orderBy: desc(order.createdAt),
            with: withLines,
        });

        const transformed = rows
            .map((row) => {
                // A line whose product was deleted has no `productId` left to
                // attribute, so it can't be claimed here.
                const lines = row.items
                    .filter((item) => item.product?.ownerId === ownerId)
                    .map(toOrderHistoryLine);

                return {
                    id: row.id,
                    status: row.status as OrderStatus,
                    createdAt: row.createdAt,
                    buyerEmail: row.buyerEmail,
                    total: lines.reduce((sum, line) => sum + line.lineTotal, 0),
                    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
                    lines,
                };
            })
            .filter((sale) => sale.lines.length > 0);


        return transformed
    } catch (error) {
        throw error
    }


}
