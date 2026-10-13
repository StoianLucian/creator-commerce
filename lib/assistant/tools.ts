// lib/assistant/tools.ts
//
// The tools the assistant can call, and the code that runs them. Everything
// here is scoped to one creator (`ownerId`) — the model can only ever see the
// signed-in creator's own sales and catalog, never anyone else's.
//
// Server-only: these reach straight into the `server-only` data layer.

import "server-only";

import { getMySales } from "@/lib/data/orders";
import { getProductsByOwner, getStoreProducts } from "@/lib/data/products";
import { DashboardPaths } from "@/enums/AppPaths";
import type { OllamaTool } from "@/lib/ollama";
import type { ProductCard } from "./types";

/** What a tool run hands back: the text the model sees, plus optional product
 *  cards for the UI to render (never shown to the model). */
export type ToolResult = { content: string; products?: ProductCard[] };

/** Order amounts are stored in bani (minor unit); the catalog is in whole lei. */
const baniToLei = (bani: number) => Math.round(bani) / 100;

/**
 * The system prompt. It tells the model what it is, what it can reach, and —
 * importantly for small local models — to lean on the tools instead of
 * guessing, and to answer only from what the tools return.
 */
export const SYSTEM_PROMPT = [
    "You are the sales assistant for a creator selling products on Creator Commerce.",
    "You help the creator understand what they have sold and decide what to do next.",
    "",
    "Rules:",
    "- Always call the provided tools to get real figures before answering. Never invent numbers, product names, or dates.",
    "- `get_sold_products` returns what the creator has actually sold (units and revenue). `get_product_catalog` returns the creator's own listings, including ones that have never sold.",
    "- `suggest_products` returns products available to buy across the whole store (most popular first). Use it whenever the user asks for product suggestions or recommendations.",
    "- To recommend products to buy, call `suggest_products` and pick good matches from what it returns. The creator having no products of their own is fine — recommend from the store. Only say nothing is available if `suggest_products` itself comes back empty.",
    "- When you recommend a product, ALWAYS link to it using its `url` field as a markdown link, e.g. `[Product name](url)`. Never show a product name without its link, and never invent a URL.",
    "- When asked how to improve their own sales, reason over `get_sold_products` and `get_product_catalog`: highlight best sellers worth promoting or restocking, and flag listed products with zero sales.",
    "- All money is in Romanian lei (RON). State amounts with the lei values the tools give you.",
    "- Be concise and concrete. Prefer short lists over long paragraphs.",
].join("\n");

/** The tool schemas advertised to the model. Both are scoped to the caller. */
export const ASSISTANT_TOOLS: OllamaTool[] = [
    {
        type: "function",
        function: {
            name: "get_sold_products",
            description:
                "Get the signed-in creator's actual sales: total revenue and units sold, " +
                "plus a per-product breakdown of units sold, revenue, and order count. " +
                "Use this for any question about what has sold or how much was earned.",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "get_product_catalog",
            description:
                "List every product the signed-in creator has listed themselves, including " +
                "price, publication status, and lifetime units sold — even products with zero " +
                "sales. Use this to advise the creator on promoting, restocking, or re-pricing " +
                "their OWN products.",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "suggest_products",
            description:
                "Browse products available to buy across the whole store, most popular first, " +
                "with name, price, category, and how many have sold. Use this to recommend or " +
                "suggest products to the user — it is not limited to the creator's own listings.",
            parameters: { type: "object", properties: {} },
        },
    },
];

const TOOL_NAMES = new Set(ASSISTANT_TOOLS.map((tool) => tool.function.name));

/** Aggregate the creator's paid orders into one row per product. */
async function getSoldProducts(ownerId: string) {
    const sales = await getMySales();

    type Row = { product: string; unitsSold: number; revenueLei: number; orders: number };
    const byProduct = new Map<string, Row>();

    for (const sale of sales) {
        for (const line of sale.lines) {
            const row = byProduct.get(line.name) ?? {
                product: line.name,
                unitsSold: 0,
                revenueLei: 0,
                orders: 0,
            };
            row.unitsSold += line.quantity;
            row.revenueLei += baniToLei(line.lineTotal);
            row.orders += 1;
            byProduct.set(line.name, row);
        }
    }

    const products = [...byProduct.values()]
        .map((row) => ({ ...row, revenueLei: Math.round(row.revenueLei * 100) / 100 }))
        .sort((a, b) => b.revenueLei - a.revenueLei);

    return {
        ownerId,
        currency: "RON",
        totalRevenueLei: Math.round(baniToLei(sales.reduce((sum, s) => sum + s.total, 0)) * 100) / 100,
        totalUnitsSold: sales.reduce((sum, s) => sum + s.itemCount, 0),
        paidOrders: sales.length,
        products,
    };
}

/** The creator's full catalog, so the model can spot unsold or draft listings. */
async function getProductCatalog(ownerId: string) {
    const products = await getProductsByOwner(ownerId);

    return {
        currency: "RON",
        products: products.map((p) => ({
            name: p.name,
            priceLei: p.price,
            status: p.status,
            lifetimeUnitsSold: p.sold,
            listedOn: p.created_at?.toISOString().slice(0, 10) ?? null,
        })),
    };
}

/**
 * Products anyone can buy across the store, for recommendations. Returns the
 * text the model reasons over (no image URLs — those are only noise to it) and
 * the richer cards the UI renders.
 */
async function suggestProducts(): Promise<ToolResult> {
    const products = await getStoreProducts();

    const rows = products.map((p) => ({
        name: p.name,
        priceLei: p.price,
        category: p.category?.name ?? null,
        seller: p.owner?.username ?? null,
        unitsSold: p.sold,
        description: p.description ?? null,
        imageUrl: p.images[0]?.imageUrl ?? null,
        // Buyer-facing product page, so a recommendation can link straight to
        // it. Null if the seller has no username to build a path from.
        url: p.owner?.username
            ? DashboardPaths.product(p.owner.username, p.id, p.slug)
            : null,
    }));

    const forModel = {
        currency: "RON",
        products: rows.map(({ imageUrl: _imageUrl, ...rest }) => rest),
    };

    const cards: ProductCard[] = rows
        .filter((p): p is typeof p & { url: string } => !!p.url)
        .map((p) => ({
            name: p.name,
            priceLei: p.priceLei,
            category: p.category,
            url: p.url,
            imageUrl: p.imageUrl,
        }));

    return { content: JSON.stringify(forModel), products: cards };
}

/**
 * Run a tool the model asked for and return its result as a JSON string (the
 * shape Ollama expects back in a `role: "tool"` message). Unknown tools get a
 * structured error rather than throwing, so a model misfire can't crash the
 * whole turn.
 */
export async function runTool(
    name: string,
    ownerId: string
): Promise<ToolResult> {
    if (!TOOL_NAMES.has(name)) {
        return { content: JSON.stringify({ error: `Unknown tool: ${name}` }) };
    }

    try {
        if (name === "suggest_products") return await suggestProducts();

        const result =
            name === "get_sold_products"
                ? await getSoldProducts(ownerId)
                : await getProductCatalog(ownerId);

        return { content: JSON.stringify(result) };
    } catch (error) {
        return {
            content: JSON.stringify({
                error: error instanceof Error ? error.message : "Tool failed to run.",
            }),
        };
    }
}
