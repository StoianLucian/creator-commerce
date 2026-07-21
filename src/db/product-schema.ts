import { user } from "@/auth-schema";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, serial, integer } from "drizzle-orm/pg-core";

export const product = pgTable("products", {
    id: serial().primaryKey(),
    name: text().notNull(),
    ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    type: text().notNull(),
    status: text().notNull(),
    sold: integer().notNull(),
    price: integer().notNull(),
    created_at: timestamp().defaultNow(),
});