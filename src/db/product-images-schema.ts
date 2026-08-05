
import { pgTable, text, index, serial, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { product } from "./product-schema";

export const productImages = pgTable(
    "product_images",
    {
        id: serial().primaryKey(),
        productId: integer("product_id")
            .notNull()
            .references(() => product.id, { onDelete: "cascade" }),
        imageUrl: text("image_url").notNull(),
        imageKey: text("image_key").notNull(),
    },
    (table) => [
        index("product_images_product_id_idx").on(table.productId),
    ]
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(product, {
        fields: [productImages.productId],
        references: [product.id],
    }),
}));
