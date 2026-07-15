import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    created_at: timestamp().defaultNow(),
});

export const product = pgTable("products", {
    id: serial().primaryKey(),
    name: text().notNull(),
    type: text().notNull(),
    status: text().notNull(),
    sold: integer().notNull(),
    price: integer().notNull(),
    created_at: timestamp().defaultNow(),
});