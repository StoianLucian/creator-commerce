import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getProductByHandleMock, isHandleOwnerMock, notFoundMock, redirectMock } =
    vi.hoisted(() => ({
        getProductByHandleMock: vi.fn(),
        isHandleOwnerMock: vi.fn(),
        // Mirror Next's control flow: both throw so execution stops, like the real ones.
        notFoundMock: vi.fn(() => {
            throw new Error("NEXT_NOT_FOUND");
        }),
        redirectMock: vi.fn((url: string) => {
            throw new Error(`NEXT_REDIRECT:${url}`);
        }),
    }));

vi.mock("next/navigation", () => ({
    notFound: notFoundMock,
    redirect: redirectMock,
}));

vi.mock("@/lib/actions/products", () => ({
    getProductByHandle: getProductByHandleMock,
}));

vi.mock("@/lib/data/creators", () => ({
    isHandleOwner: isHandleOwnerMock,
}));

vi.mock("@/components/products-page/ShowProduct", () => ({
    ShowProduct: ({ isOwner, username }: { isOwner: boolean; username: string }) => (
        <div data-testid="show-product" data-is-owner={String(isOwner)} data-username={username} />
    ),
}));

import Product from "@/app/(app)/[handler]/products/[new]/[slug]/page";
import { DashboardPaths } from "@/enums/AppPaths";

const params = (overrides?: Record<string, string>) =>
    Promise.resolve({ handler: "@lucians", new: "13", slug: "asd", ...overrides });

const product = { id: 13, name: "Thing", slug: "asd" };

afterEach(() => vi.clearAllMocks());

describe("owner product detail route", () => {
    it("404s when the product does not exist", async () => {
        getProductByHandleMock.mockResolvedValue(null);

        // @ts-expect-error — test passes a plain params promise
        await expect(Product({ params: params() })).rejects.toThrow("NEXT_NOT_FOUND");
        expect(notFoundMock).toHaveBeenCalled();
        expect(getProductByHandleMock).toHaveBeenCalledWith("lucians", 13);
    });

    it("redirects a non-owner to the buyer-facing dashboard detail", async () => {
        getProductByHandleMock.mockResolvedValue(product);
        isHandleOwnerMock.mockResolvedValue(false);

        await expect(
            // @ts-expect-error — test passes a plain params promise
            Product({ params: params() }),
        ).rejects.toThrow(`NEXT_REDIRECT:${DashboardPaths.product("lucians", "13", "asd")}`);
        expect(redirectMock).toHaveBeenCalledWith("/dashboard/lucians/13/asd");
    });

    it("renders the owner management view for the owner", async () => {
        getProductByHandleMock.mockResolvedValue(product);
        isHandleOwnerMock.mockResolvedValue(true);

        // @ts-expect-error — test passes a plain params promise
        const ui = await Product({ params: params() });
        render(ui);

        const el = screen.getByTestId("show-product");
        expect(el).toHaveAttribute("data-is-owner", "true");
        expect(el).toHaveAttribute("data-username", "lucians");
        expect(redirectMock).not.toHaveBeenCalled();
    });
});
