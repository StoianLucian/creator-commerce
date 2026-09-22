import { user } from "./auth-schema";
import { pgTable, text, timestamp, index, serial, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { category } from "./category-schema";
import { productImages } from "./product-images-schema";

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
        // Soft delete: non-null once the owner deletes the product. Kept so
        // order history keeps resolving the product it was sold as.
        deleted_at: timestamp(),
    },
    (table) => [
        index("products_owner_id_idx").on(table.ownerId),
    ]
);

export const productRelations = relations(product, ({ one, many }) => ({
    category: one(category, {
        fields: [product.categoryId],
        references: [category.id],
    }),
    images: many(productImages),
    owner: one(user, {
        fields: [product.ownerId],
        references: [user.id],
    }),
}));

export type NewProduct = typeof product.$inferInsert;