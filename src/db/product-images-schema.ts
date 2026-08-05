
import { pgTable, text, index, serial, integer } from "drizzle-orm/pg-core";
import { product } from "./exports";

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
