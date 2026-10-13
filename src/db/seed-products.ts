import "dotenv/config";
import slugify from "slugify";
import { and, eq, inArray } from "drizzle-orm";

import { db } from ".";
import { user } from "./auth-schema";
import { category } from "./category-schema";
import { product } from "./product-schema";
import { productImages } from "./product-images-schema";

// The creator these demo products are listed under.
const OWNER_USERNAME = "lucians";

// 10 real products looked up on emag.ro. Prices are in whole lei (the app
// stores and displays whole-leu prices). `category` matches a seeded
// category name. Book prices are approximate — eMAG's listing page did not
// expose a price for them.
const products = [
    {
        name: "Apple iPhone 17 Pro, 256GB, 5G, Deep Blue",
        price: 6400,
        category: "Electronics",
        description:
            "Smartphone Apple iPhone 17 Pro cu 256GB stocare, conectivitate 5G, culoare Deep Blue.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/102972/102971595/images/res_6d7c3a407f22da1525a05f5a9e491288.jpg",
    },
    {
        name: "Samsung Galaxy S26 Ultra, 12GB RAM, 512GB, 5G, Black",
        price: 6500,
        category: "Electronics",
        description:
            "Telefon mobil Samsung Galaxy S26 Ultra, Dual SIM, 12GB RAM, 512GB, 5G, negru.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/114754/114753965/images/res_3f4bd4117858fd2c6bce0344ff03dff3.jpg",
    },
    {
        name: 'Apple MacBook Air 13" Apple M5, 16GB RAM, 512GB SSD, Midnight',
        price: 6900,
        category: "Electronics",
        description:
            "Laptop Apple MacBook Air 13 inch cu procesor Apple M5, 16GB RAM, 512GB SSD, culoare Midnight.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/88283/88282977/images/res_a6c650c79a72885951461ac3b97b0380.jpg",
    },
    {
        name: "Laptop Gaming MSI Thin 15 B13VE, i5-13420H, 16GB RAM, 512GB SSD, RTX 4050",
        price: 4300,
        category: "Electronics",
        description:
            "Laptop gaming MSI Thin 15 cu Intel Core i5-13420H, 16GB RAM, 512GB SSD si placa video RTX 4050.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/116383/116382060/images/res_f17d9d1708d2fe6b83aaae3b495dba4c.png",
    },
    {
        name: "Laptop HP 255R G10, AMD Ryzen 3 7335U, 16GB RAM, 512GB SSD",
        price: 2400,
        category: "Electronics",
        description:
            "Laptop HP 255R G10 cu procesor AMD Ryzen 3 7335U, 16GB RAM, 512GB SSD, culoare Dark Ash Silver.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/117508/117507722/images/res_e6dd3e5b3182d0d1c1666c86670c4590.png",
    },
    {
        name: 'Laptop ASUS Zenbook S 14 UX5406SA, Ultra 7 258V, 32GB RAM, 1TB SSD',
        price: 9500,
        category: "Electronics",
        description:
            "Laptop ASUS Zenbook S 14 cu Intel Ultra 7 258V, 32GB RAM, 1TB SSD, Windows 11 Pro, Scandinavian White.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/79567/79566295/images/res_470d97d61ddd3fe12d580271134eb018.png",
    },
    {
        name: "Televizor Samsung MiniLED 50M72H",
        price: 1900,
        category: "Home & Garden",
        description:
            "Televizor Samsung cu tehnologie MiniLED, diagonala 50 inch, model 50M72H.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/121334/121333019/images/res_a82999df1713065651cce92afcb21a1d.png",
    },
    {
        name: "Televizor TCL QLED 55T69C",
        price: 1800,
        category: "Home & Garden",
        description:
            "Televizor TCL cu panou QLED, diagonala 55 inch, model 55T69C.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/116441/116440014/images/res_710c26d2d82a24c6384dd79796c479a0.png",
    },
    {
        name: "Televizor LED Diamant by Horizon 32HL4331H/C",
        price: 600,
        category: "Home & Garden",
        description:
            "Televizor LED Diamant by Horizon, diagonala 32 inch, model 32HL4331H/C.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/75133/75132943/images/res_40904e807796a6ececf60e1c248703aa.jpg",
    },
    {
        name: "Album foto Romania Salbatica",
        price: 150,
        category: "Books",
        description:
            "Album foto Romania Salbatica — o colectie de fotografii cu natura salbatica a Romaniei.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/42715/42714102/images/res_0679d5a52fe1978e1953dfdde361edd7.jpg",
    },
];

async function seedProducts() {
    const [owner] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.username, OWNER_USERNAME));

    if (!owner) {
        throw new Error(`No user with username "${OWNER_USERNAME}" to own the products`);
    }

    const categories = await db.select().from(category);
    const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

    // Idempotent: skip any product name this owner already has, so re-running
    // doesn't create duplicates (the name column has no unique constraint).
    const names = products.map((p) => p.name);
    const existing = await db
        .select({ name: product.name })
        .from(product)
        .where(and(eq(product.ownerId, owner.id), inArray(product.name, names)));
    const existingNames = new Set(existing.map((p) => p.name));

    let inserted = 0;

    for (const p of products) {
        if (existingNames.has(p.name)) {
            console.log(`skip (exists): ${p.name}`);
            continue;
        }

        const categoryId = categoryIdByName.get(p.category);
        if (categoryId == null) {
            console.warn(`skip (no category "${p.category}"): ${p.name}`);
            continue;
        }

        const [newProduct] = await db
            .insert(product)
            .values({
                name: p.name,
                description: p.description,
                ownerId: owner.id,
                categoryId,
                status: "active",
                slug: slugify(p.name, { lower: true, strict: true }),
                sold: 0,
                price: p.price,
            })
            .returning({ id: product.id });

        await db.insert(productImages).values({
            productId: newProduct.id,
            imageUrl: p.imageUrl,
            // External seed image — no uploadthing key to delete later.
            imageKey: `emag-seed-${newProduct.id}`,
        });

        inserted += 1;
        console.log(`added: ${p.name} (${p.price} lei)`);
    }

    console.log(`\nDone. Inserted ${inserted} product(s).`);
    process.exit(0);
}

seedProducts().catch((error) => {
    console.error(error);
    process.exit(1);
});
