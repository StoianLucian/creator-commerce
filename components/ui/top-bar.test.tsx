import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: any) => (
        <a href={typeof href === "string" ? href : "#"} {...props}>
            {children}
        </a>
    ),
}));

// Stub the children that bring their own data/context so the TopBar renders
// cleanly and we can assert which branch is shown.
vi.mock("@/components/cart/CartSheet", () => ({
    CartSheet: () => <div data-testid="cart-sheet" />,
}));

vi.mock("@/components/logount-button/LogoutButton", () => ({
    LogoutButton: () => <div data-testid="logout-button">Log out</div>,
}));

// Passthrough the dropdown so its content renders without needing a click to
// open the (portaled) menu.
vi.mock("@/components/ui/dropdown-menu", () => {
    const Pass = ({ children }: any) => <div>{children}</div>;
    return {
        DropdownMenu: Pass,
        DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
        DropdownMenuContent: Pass,
        DropdownMenuSeparator: () => null,
        DropdownMenuItem: ({ render, children }: any) =>
            render ? React.cloneElement(render, {}, children) : <div>{children}</div>,
    };
});

vi.mock("@/components/ui/avatar", () => ({
    Avatar: ({ children }: any) => <div>{children}</div>,
    AvatarImage: () => null,
    AvatarFallback: ({ children }: any) => <span>{children}</span>,
}));

import { TopBar } from "@/components/ui/top-bar";
import { AppPaths } from "@/enums/AppPaths";

afterEach(() => {
    vi.clearAllMocks();
});

const user = {
    name: "Luci Ans",
    email: "luci@example.com",
    username: "lucians",
    image: null,
};

describe("TopBar", () => {
    it("shows the account menu with a Settings link and a logout item when signed in", () => {
        render(<TopBar user={user} isSignedIn />);

        const settings = screen.getByRole("link", { name: /settings/i });
        expect(settings).toHaveAttribute("href", AppPaths.SETTINGS);
        expect(screen.getByTestId("logout-button")).toBeInTheDocument();

        // No auth links while signed in.
        expect(screen.queryByText("Log in")).toBeNull();
        expect(screen.queryByText("Sign up")).toBeNull();
    });

    it("shows Log in / Sign up links when signed out", () => {
        render(<TopBar />);

        // The auth links are base-ui Buttons rendering a Link, so they expose
        // role="button" rather than role="link".
        expect(screen.getByRole("button", { name: /log in/i })).toHaveAttribute(
            "href",
            AppPaths.LOGIN,
        );
        expect(screen.getByRole("button", { name: /sign up/i })).toHaveAttribute(
            "href",
            AppPaths.REGISTER,
        );
        expect(screen.queryByTestId("logout-button")).toBeNull();
    });
});
