import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getProductByHandleMock, notFoundMock } = vi.hoisted(() => ({
    getProductByHandleMock: vi.fn(),
    notFoundMock: vi.fn(() => {
        throw new Error("NEXT_NOT_FOUND");
    }),
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

vi.mock("@/lib/actions/products", () => ({
    getProductByHandle: getProductByHandleMock,
}));

vi.mock("@/components/products-page/ShowProduct", () => ({
    ShowProduct: ({ isOwner, username }: { isOwner: boolean; username: string }) => (
        <div data-testid="show-product" data-is-owner={String(isOwner)} data-username={username} />
    ),
}));

import ExploreProduct from "@/app/(app)/dashboard/[user]/[id]/[slug]/page";

const params = Promise.resolve({ user: "lucians", id: "13", slug: "asd" });
const product = { id: 13, name: "Thing", slug: "asd" };

afterEach(() => vi.clearAllMocks());

describe("buyer (dashboard) product detail route", () => {
    it("looks the product up by the bare username + id", async () => {
        getProductByHandleMock.mockResolvedValue(product);
        // @ts-expect-error — test passes a plain params promise
        await ExploreProduct({ params });
        expect(getProductByHandleMock).toHaveBeenCalledWith("lucians", 13);
    });

    it("404s when the product does not exist", async () => {
        getProductByHandleMock.mockResolvedValue(null);
        // @ts-expect-error — test passes a plain params promise
        await expect(ExploreProduct({ params })).rejects.toThrow("NEXT_NOT_FOUND");
        expect(notFoundMock).toHaveBeenCalled();
    });

    it("always renders the shopper view (isOwner=false)", async () => {
        getProductByHandleMock.mockResolvedValue(product);
        // @ts-expect-error — test passes a plain params promise
        const ui = await ExploreProduct({ params });
        render(ui);

        const el = screen.getByTestId("show-product");
        expect(el).toHaveAttribute("data-is-owner", "false");
        expect(el).toHaveAttribute("data-username", "lucians");
    });
});
