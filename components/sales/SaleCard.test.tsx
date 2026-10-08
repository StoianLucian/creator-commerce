import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SaleCard } from "./SaleCard";
import type { SaleEntry } from "@/lib/data/orders";

afterEach(() => {
    vi.clearAllMocks();
});

function makeSale(overrides: Partial<SaleEntry> = {}): SaleEntry {
    return {
        id: 987,
        status: "paid",
        createdAt: new Date("2026-02-20T09:30:00Z"),
        buyerEmail: "buyer@example.com",
        total: 4200, // cents -> $42
        itemCount: 3,
        lines: [
            {
                id: 1,
                name: "Enamel Pin",
                quantity: 3,
                unitPrice: 1400, // $14
                lineTotal: 4200, // $42
                imageUrl: "https://img.test/pin.jpg",
                href: "/creator/lucians/1/enamel-pin",
            },
        ],
        ...overrides,
    };
}

describe("SaleCard", () => {
    it("renders the order id, status, formatted date, buyer and total", () => {
        render(<SaleCard sale={makeSale()} />);

        expect(screen.getByText("Order #987")).toBeInTheDocument();
        expect(screen.getByText("Paid")).toBeInTheDocument();
        // dateFormatter (medium, UTC) -> "Feb 20, 2026"
        expect(screen.getByText(/Feb 20, 2026/)).toBeInTheDocument();
        expect(screen.getByText(/buyer@example.com/)).toBeInTheDocument();
        // total 4200 cents -> $42 (appears as the order total and the single
        // line's total, which are equal here).
        expect(screen.getAllByText("$42").length).toBeGreaterThanOrEqual(1);
    });

    it("renders the product line with its per-unit pricing", () => {
        render(<SaleCard sale={makeSale()} />);

        const link = screen.getByRole("link", { name: "Enamel Pin" });
        expect(link).toHaveAttribute("href", "/creator/lucians/1/enamel-pin");
        expect(screen.getByText("$14 × 3")).toBeInTheDocument();
    });

    it("omits the buyer email when it is null", () => {
        render(<SaleCard sale={makeSale({ buyerEmail: null })} />);
        expect(screen.queryByText(/@example.com/)).toBeNull();
        // Still shows the item count metadata.
        expect(screen.getByText(/3 items/)).toBeInTheDocument();
    });
});
