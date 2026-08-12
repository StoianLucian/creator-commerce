"use server";

// The data layer is `server-only`, so client components reach it through
// this file instead of importing it directly.

import { getMySales, type SaleEntry } from "@/lib/data/orders";

/** Client-callable wrapper around `getMySales` — auth lives in there. */
export async function fetchMySales(): Promise<SaleEntry[]> {
    return getMySales();
}
