import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useSalesMock } = vi.hoisted(() => ({
    useSalesMock: vi.fn(),
}));

vi.mock("@/hooks/useSales", () => ({
    useSales: useSalesMock,
}));

vi.mock("@/app/components/ChartTest", () => ({
    MyChart: () => <div data-testid="chart" />,
}));

vi.mock("@/components/sales/SaleCard", () => ({
    SaleCard: ({ sale }: any) => <li data-testid="sale-card">sale {sale.id}</li>,
}));

import SalesList from "@/app/components/SalesList";

function makeSale(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 1,
        status: "paid",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        buyerEmail: "buyer@example.com",
        total: 2500,
        itemCount: 2,
        lines: [],
        ...overrides,
    };
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("SalesList", () => {
    it("renders skeletons while pending", () => {
        useSalesMock.mockReturnValue({ data: [], isPending: true, isError: false });
        const { container } = render(<SalesList />);

        expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(3);
        expect(screen.queryByText("No sales yet")).toBeNull();
    });

    it("shows the empty state when there are no sales", () => {
        useSalesMock.mockReturnValue({ data: [], isPending: false, isError: false });
        render(<SalesList />);

        expect(screen.getByText("No sales yet")).toBeInTheDocument();
    });

    it("renders a chart and a card per sale when populated", () => {
        useSalesMock.mockReturnValue({
            data: [makeSale({ id: 1 }), makeSale({ id: 2 })],
            isPending: false,
            isError: false,
        });
        render(<SalesList />);

        expect(screen.getByTestId("chart")).toBeInTheDocument();
        expect(screen.getAllByTestId("sale-card")).toHaveLength(2);
        expect(screen.getByText("Total revenue")).toBeInTheDocument();
    });

    it("renders an error state", () => {
        useSalesMock.mockReturnValue({
            data: [],
            isPending: false,
            isError: true,
            error: new Error("boom"),
        });
        render(<SalesList />);

        expect(screen.getByText("Could not load your sales")).toBeInTheDocument();
        expect(screen.getByText("boom")).toBeInTheDocument();
    });
});
