import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { usePathnameMock } = vi.hoisted(() => ({
    usePathnameMock: vi.fn(() => "/dashboard"),
}));

vi.mock("next/navigation", () => ({
    usePathname: usePathnameMock,
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: any) => (
        <a href={typeof href === "string" ? href : "#"} {...props}>
            {children}
        </a>
    ),
}));

// Passthrough stubs for the shadcn Sidebar primitives, which otherwise require
// a SidebarProvider context (and matchMedia) that we don't want to set up here.
vi.mock("@/components/ui/sidebar", () => {
    const Pass = ({ children }: any) => <div>{children}</div>;
    return {
        Sidebar: Pass,
        SidebarContent: Pass,
        SidebarGroup: Pass,
        SidebarGroupContent: Pass,
        SidebarGroupLabel: Pass,
        SidebarHeader: Pass,
        SidebarMenu: ({ children }: any) => <ul>{children}</ul>,
        SidebarMenuItem: ({ children }: any) => <li>{children}</li>,
        SidebarMenuButton: ({ children }: any) => <div>{children}</div>,
    };
});

vi.mock("@/components/ui/avatar", () => ({
    Avatar: ({ children }: any) => <div>{children}</div>,
    AvatarImage: () => null,
    AvatarFallback: ({ children }: any) => (
        <span data-testid="avatar-fallback">{children}</span>
    ),
}));

import { NavBar } from "@/app/components/NavBar";

afterEach(() => {
    vi.clearAllMocks();
});

const baseUser = {
    name: "Luci Ans",
    email: "luci@example.com",
    username: "lucians",
    image: null,
};

describe("NavBar", () => {
    it("shows Products/Orders/Sales for a signed-in creator with a username", () => {
        render(<NavBar user={baseUser} isSignedIn />);

        // Query by link to avoid the "Explore" group label colliding with the
        // "Explore" nav item text.
        expect(screen.getByRole("link", { name: "Products" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Orders" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Sales" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Explore" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Wishlist" })).toBeInTheDocument();
    });

    it("omits Products when the signed-in user has no username", () => {
        render(<NavBar user={{ ...baseUser, username: null }} isSignedIn />);

        expect(screen.queryByRole("link", { name: "Products" })).toBeNull();
        expect(screen.getByRole("link", { name: "Orders" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Sales" })).toBeInTheDocument();
    });

    it("shows only Explore/Wishlist for guests", () => {
        render(<NavBar user={baseUser} isSignedIn={false} />);

        expect(screen.getByRole("link", { name: "Explore" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Wishlist" })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Products" })).toBeNull();
        expect(screen.queryByRole("link", { name: "Orders" })).toBeNull();
        expect(screen.queryByRole("link", { name: "Sales" })).toBeNull();
    });

    it("renders the avatar initials and the @handle", () => {
        render(<NavBar user={baseUser} isSignedIn />);

        expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("LA");
        expect(screen.getByText("@lucians")).toBeInTheDocument();
        expect(screen.getByText("Luci Ans")).toBeInTheDocument();
    });

    it("falls back to the email when there is no username", () => {
        render(<NavBar user={{ ...baseUser, username: null }} isSignedIn />);

        expect(screen.getByText("luci@example.com")).toBeInTheDocument();
    });
});
