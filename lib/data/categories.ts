import { db } from "@/src/db";
import { category } from "@/src/db/category-schema";
import { desc, eq } from "drizzle-orm";

export async function getCategories() {
    return db
        .select()
        .from(category)
        .orderBy(desc(category.name));
}
