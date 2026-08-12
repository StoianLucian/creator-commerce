import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, serial, index } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { product } from "./product-schema";

/**
 * "pending" | "paid" | "failed" | "canceled"
 *
 * Kept as `text` rather than a pg enum, matching `product.status` elsewhere
 * in this schema.
 */
export type OrderStatus = "pending" | "paid" | "failed" | "canceled";

export const order = pgTable(
    "orders",
    {
        id: serial().primaryKey(),

        // Nullable: the cart is guest-friendly (see lib/cart), so checkout
        // doesn't require an account. `onDelete: "set null"` keeps the order
        // around (for accounting/history) if the buyer's account goes away.
        buyerId: text("buyer_id").references(() => user.id, {
            onDelete: "set null",
        }),
        // Null until Stripe reports it back (via the checkout webhook) —
        // guests haven't typed an email yet at the point the order row is
        // first created.
        buyerEmail: text("buyer_email"),

        status: text().notNull().default("pending"),

        // Stripe Checkout Session id. Unique so a session can only ever back
        // one order, and so webhook deliveries are safe to retry/replay.
        stripeCheckoutSessionId: text("stripe_checkout_session_id")
            .notNull()
            .unique(),
        stripePaymentIntentId: text("stripe_payment_intent_id"),

        // Amounts in cents (Stripe's unit), not the whole-dollar unit
        // `product.price` uses — converted once at checkout time.
        subtotal: integer().notNull(),
        currency: text().notNull().default("usd"),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [
        index("orders_buyer_id_idx").on(table.buyerId),
        index("orders_stripe_checkout_session_id_idx").on(
            table.stripeCheckoutSessionId
        ),
    ]
);

export const orderItem = pgTable(
    "order_items",
    {
        id: serial().primaryKey(),

        orderId: integer("order_id")
            .notNull()
            .references(() => order.id, { onDelete: "cascade" }),

        // Nullable + "set null" on delete: an order should still show what
        // was bought even if the product is later removed. The snapshot
        // fields below are what actually render the order history; this is
        // just a best-effort link back to the live product.
        productId: integer("product_id").references(() => product.id, {
            onDelete: "set null",
        }),

        // Snapshot of the product at purchase time, in cents, so a later
        // price change or rename can't rewrite history.
        productName: text("product_name").notNull(),
        unitPrice: integer("unit_price").notNull(),
        quantity: integer().notNull(),
        lineTotal: integer("line_total").notNull(),
    },
    (table) => [index("order_items_order_id_idx").on(table.orderId)]
);

export const orderRelations = relations(order, ({ one, many }) => ({
    buyer: one(user, {
        fields: [order.buyerId],
        references: [user.id],
    }),
    items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
    order: one(order, {
        fields: [orderItem.orderId],
        references: [order.id],
    }),
    product: one(product, {
        fields: [orderItem.productId],
        references: [product.id],
    }),
}));

export type NewOrder = typeof order.$inferInsert;
export type NewOrderItem = typeof orderItem.$inferInsert;
