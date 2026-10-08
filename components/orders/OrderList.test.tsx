import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./OrderCard", () => ({
    OrderCard: ({ entry }: { entry: { id: number; status: string } }) => (
        <li data-testid="order-card" data-order-id={entry.id}>
            Order #{entry.id} — {entry.status}
        </li>
    ),
}));

import { OrderList } from "./OrderList";
import type { OrderHistoryEntry } from "@/lib/data/orders";

afterEach(() => {
    vi.clearAllMocks();
});

function makeEntry(
    overrides: Partial<OrderHistoryEntry> = {},
): OrderHistoryEntry {
    return {
        id: 1,
        status: "paid",
        subtotal: 1000,
        createdAt: new Date("2026-01-15T12:00:00Z"),
        itemCount: 1,
        lines: [
            {
                id: 1,
                name: "Cool Shirt",
                quantity: 1,
                unitPrice: 1000,
                lineTotal: 1000,
                imageUrl: null,
                href: null,
            },
        ],
        ...overrides,
    };
}

const orders: OrderHistoryEntry[] = [
    makeEntry({
        id: 1,
        status: "paid",
        lines: [
            {
                id: 11,
                name: "Cool Shirt",
                quantity: 1,
                unitPrice: 1000,
                lineTotal: 1000,
                imageUrl: null,
                href: null,
            },
        ],
    }),
    makeEntry({
        id: 2,
        status: "pending",
        lines: [
            {
                id: 21,
                name: "Sticker Pack",
                quantity: 1,
                unitPrice: 1000,
                lineTotal: 1000,
                imageUrl: null,
                href: null,
            },
        ],
    }),
];

describe("OrderList", () => {
    it("renders every order up front", () => {
        render(<OrderList orders={orders} />);
        expect(screen.getAllByTestId("order-card")).toHaveLength(2);
    });

    it("filters the list by product name as the user types", async () => {
        const user = userEvent.setup();
        render(<OrderList orders={orders} />);

        await user.type(screen.getByLabelText("Search orders"), "sticker");

        const cards = screen.getAllByTestId("order-card");
        expect(cards).toHaveLength(1);
        expect(cards[0]).toHaveAttribute("data-order-id", "2");
    });

    it("filters by order number", async () => {
        const user = userEvent.setup();
        render(<OrderList orders={orders} />);

        await user.type(screen.getByLabelText("Search orders"), "#1");

        const cards = screen.getAllByTestId("order-card");
        expect(cards).toHaveLength(1);
        expect(cards[0]).toHaveAttribute("data-order-id", "1");
    });

    it("shows a no-match message when nothing matches", async () => {
        const user = userEvent.setup();
        render(<OrderList orders={orders} />);

        await user.type(screen.getByLabelText("Search orders"), "nonsense");

        expect(screen.queryByTestId("order-card")).toBeNull();
        expect(
            screen.getByText(/No orders match .*nonsense/),
        ).toBeInTheDocument();
    });
});
