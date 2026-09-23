import "dotenv/config";
import { db } from ".";
import { category } from "./category-schema";

const categories = [
    { name: "Electronics" },
    { name: "Clothing" },
    { name: "Home & Garden" },
    { name: "Sports" },
    { name: "Books" },
    { name: "Vehicles" },
    { name: "Furniture" },
    { name: "Toys" },
];

// Idempotent: category.name is unique, so onConflictDoNothing lets this be
// re-run safely per environment without erroring on already-seeded rows.
async function seed() {
    await db.insert(category).values(categories).onConflictDoNothing();

    process.exit(0);
}

seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
