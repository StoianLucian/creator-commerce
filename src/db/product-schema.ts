import { user } from "@/auth-schema";
import { pgTable, text, timestamp, index, serial, integer } from "drizzle-orm/pg-core";
import { category } from "./category-schema";

export const product = pgTable(
    "products",
    {
        id: serial().primaryKey(),
        name: text().notNull(),
        description: text(),
        ownerId: text("owner_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        categoryId: integer("category_id")
            .notNull()
            .references(() => category.id, { onDelete: "cascade" }),
        status: text().notNull(),
        slug: text().notNull(),
        sold: integer().notNull(),
        price: integer().notNull(),
        created_at: timestamp().defaultNow(),
    },
    (table) => [
        index("products_owner_id_idx").on(table.ownerId),
    ]
);