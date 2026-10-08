import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderStatusBadge } from "./OrderStatusBadge";

describe("OrderStatusBadge", () => {
    it("renders the Paid label with the default (primary) variant", () => {
        render(<OrderStatusBadge status="paid" />);
        const badge = screen.getByText("Paid");
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass("bg-primary");
    });

    it("renders the Pending label with the secondary variant", () => {
        render(<OrderStatusBadge status="pending" />);
        const badge = screen.getByText("Pending");
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass("bg-secondary");
    });

    it("renders the Failed label with the destructive variant", () => {
        render(<OrderStatusBadge status="failed" />);
        const badge = screen.getByText("Failed");
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass("text-destructive");
    });

    it("renders the Canceled label with the outline variant", () => {
        render(<OrderStatusBadge status="canceled" />);
        const badge = screen.getByText("Canceled");
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass("border-border");
    });

    it("falls back to the raw status with an outline badge for unknown values", () => {
        // Status is a plain text column, so unknown values are tolerated.
        render(<OrderStatusBadge status={"refunded" as never} />);
        const badge = screen.getByText("refunded");
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass("border-border");
    });
});
