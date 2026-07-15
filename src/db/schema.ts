import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const product = pgTable("products", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull(),
    sold: integer("sold").notNull(),
    price: integer("price").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});