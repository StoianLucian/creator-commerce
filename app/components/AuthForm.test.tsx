import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { usePathnameMock } = vi.hoisted(() => ({
    usePathnameMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    usePathname: usePathnameMock,
}));

import AuthForm from "@/app/components/AuthForm";

afterEach(() => {
    vi.clearAllMocks();
});

describe("AuthForm", () => {
    it("renders its children", () => {
        usePathnameMock.mockReturnValue("/login");
        render(
            <AuthForm>
                <div data-testid="child">Hello</div>
            </AuthForm>,
        );
        expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("shows the login copy and a link to create an account on the login route", () => {
        usePathnameMock.mockReturnValue("/login");
        render(
            <AuthForm>
                <div />
            </AuthForm>,
        );

        expect(
            screen.getByText(/sign in to pick up where you left off/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/new to creator commerce\?/i)).toBeInTheDocument();

        const link = screen.getByRole("link", { name: /create an account/i });
        expect(link).toHaveAttribute("href", "/register");
    });

    it("shows the register copy and a link to sign in on the register route", () => {
        usePathnameMock.mockReturnValue("/register");
        render(
            <AuthForm>
                <div />
            </AuthForm>,
        );

        expect(
            screen.getByText(/create an account and start shopping/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();

        const link = screen.getByRole("link", { name: /^sign in$/i });
        expect(link).toHaveAttribute("href", "/login");
    });
});
