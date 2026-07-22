
import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const category = pgTable("categories", {
    id: serial().primaryKey(),
    name: text().notNull().unique(),
});