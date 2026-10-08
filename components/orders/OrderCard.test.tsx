import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OrderCard } from "./OrderCard";
import type { OrderHistoryEntry } from "@/lib/data/orders";

afterEach(() => {
    vi.clearAllMocks();
});

function makeEntry(
    overrides: Partial<OrderHistoryEntry> = {},
): OrderHistoryEntry {
    return {
        id: 1234,
        status: "paid",
        subtotal: 5000, // cents -> $50
        createdAt: new Date("2026-01-15T12:00:00Z"),
        itemCount: 2,
        lines: [
            {
                id: 1,
                name: "Cool Shirt",
                quantity: 2,
                unitPrice: 1500, // $15
                lineTotal: 3000, // $30
                imageUrl: "https://img.test/shirt.jpg",
                href: "/explore/lucians/1/cool-shirt",
            },
            {
                id: 2,
                name: "Sticker Pack",
                quantity: 1,
                unitPrice: 2000, // $20
                lineTotal: 2000,
                imageUrl: null,
                href: null,
            },
        ],
        ...overrides,
    };
}

describe("OrderCard", () => {
    it("renders the order id, formatted date, total and status badge", () => {
        render(<OrderCard entry={makeEntry()} />);

        expect(screen.getByText("Order #1234")).toBeInTheDocument();
        expect(screen.getByText("Paid")).toBeInTheDocument();
        // dateFormatter (medium, UTC) -> "Jan 15, 2026"
        expect(screen.getByText(/Jan 15, 2026/)).toBeInTheDocument();
        // subtotal 5000 cents -> $50
        expect(screen.getByText("$50")).toBeInTheDocument();
    });

    it("renders each line with its name and per-unit pricing", () => {
        render(<OrderCard entry={makeEntry()} />);

        expect(screen.getByText("Cool Shirt")).toBeInTheDocument();
        expect(screen.getByText("Sticker Pack")).toBeInTheDocument();
        // unitPrice 1500 cents x 2
        expect(screen.getByText("$15 × 2")).toBeInTheDocument();
        expect(screen.getByText("$20 × 1")).toBeInTheDocument();
    });

    it("links lines that have an href and leaves hrefless lines as plain text", () => {
        render(<OrderCard entry={makeEntry()} />);

        const link = screen.getByRole("link", { name: "Cool Shirt" });
        expect(link).toHaveAttribute(
            "href",
            "/explore/lucians/1/cool-shirt",
        );
        expect(
            screen.queryByRole("link", { name: "Sticker Pack" }),
        ).toBeNull();
    });

    it("pluralizes the item count correctly", () => {
        render(<OrderCard entry={makeEntry({ itemCount: 1 })} />);
        const meta = screen.getByText(/1 item/);
        expect(meta).toBeInTheDocument();
        expect(within(meta).queryByText(/items/)).toBeNull();
        expect(meta.textContent).not.toMatch(/items/);
    });
});
