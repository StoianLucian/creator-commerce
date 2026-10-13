// lib/assistant/types.ts
//
// Shared, framework-free types for the assistant. No `server-only` here so the
// client (hook + UI) can import the shapes it renders.

/** A product the assistant recommended, rendered as a card in the chat. */
export type ProductCard = {
    name: string;
    /** Whole lei (RON). */
    priceLei: number;
    category: string | null;
    /** Buyer-facing product page. */
    url: string;
    imageUrl: string | null;
};
