import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

describe("empty primitives", () => {
    it("renders children and applies data-slot attributes", () => {
        render(
            <Empty data-testid="empty">
                <EmptyHeader data-testid="header">
                    <EmptyMedia data-testid="media">icon</EmptyMedia>
                    <EmptyTitle data-testid="title">Nothing here</EmptyTitle>
                    <EmptyDescription data-testid="description">
                        Add something to get started
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent data-testid="content">body</EmptyContent>
            </Empty>,
        );

        expect(screen.getByTestId("empty")).toHaveAttribute("data-slot", "empty");
        expect(screen.getByTestId("header")).toHaveAttribute(
            "data-slot",
            "empty-header",
        );
        expect(screen.getByTestId("media")).toHaveAttribute(
            "data-slot",
            "empty-icon",
        );
        expect(screen.getByTestId("title")).toHaveAttribute(
            "data-slot",
            "empty-title",
        );
        expect(screen.getByTestId("description")).toHaveAttribute(
            "data-slot",
            "empty-description",
        );
        expect(screen.getByTestId("content")).toHaveAttribute(
            "data-slot",
            "empty-content",
        );

        expect(screen.getByText("Nothing here")).toBeInTheDocument();
        expect(
            screen.getByText("Add something to get started"),
        ).toBeInTheDocument();
        expect(screen.getByText("body")).toBeInTheDocument();
    });

    it("defaults EmptyMedia to the default variant", () => {
        render(<EmptyMedia data-testid="media">x</EmptyMedia>);
        const media = screen.getByTestId("media");
        expect(media).toHaveAttribute("data-variant", "default");
        expect(media).toHaveClass("bg-transparent");
    });

    it("applies the icon variant classes when variant='icon'", () => {
        render(
            <EmptyMedia data-testid="media" variant="icon">
                x
            </EmptyMedia>,
        );
        const media = screen.getByTestId("media");
        expect(media).toHaveAttribute("data-variant", "icon");
        expect(media).toHaveClass("size-8", "rounded-lg", "bg-muted");
    });

    it("merges custom classNames onto the primitives", () => {
        render(
            <Empty data-testid="empty" className="custom-empty">
                content
            </Empty>,
        );
        expect(screen.getByTestId("empty")).toHaveClass("custom-empty");
    });
});
