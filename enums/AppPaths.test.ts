import { describe, expect, it } from "vitest";

import { AppPaths, CreatorPaths, DashboardPaths } from "@/enums/AppPaths";

describe("CreatorPaths (owner-scoped, @handle URLs)", () => {
    it("builds the products list path", () => {
        expect(CreatorPaths.products("lucians")).toBe("/@lucians/products");
    });

    it("builds the new-product path", () => {
        expect(CreatorPaths.productsNew("lucians")).toBe("/@lucians/products/new");
    });

    it("builds the product detail path (owner management view)", () => {
        expect(CreatorPaths.product("lucians", 13, "asd")).toBe(
            "/@lucians/products/13/asd",
        );
    });

    it("builds the edit path", () => {
        expect(CreatorPaths.productEdit("lucians", 13)).toBe(
            "/@lucians/products/13/edit",
        );
    });
});

describe("DashboardPaths (buyer-facing Explore URLs)", () => {
    it("builds the buyer detail path under /dashboard with the bare username", () => {
        expect(DashboardPaths.product("lucians", 13, "asd")).toBe(
            "/dashboard/lucians/13/asd",
        );
    });

    it("is rooted at AppPaths.DASHBOARD", () => {
        expect(
            DashboardPaths.product("lucians", 1, "x").startsWith(AppPaths.DASHBOARD),
        ).toBe(true);
    });

    it("accepts a string id as well as a number", () => {
        expect(DashboardPaths.product("lucians", "7", "slug")).toBe(
            "/dashboard/lucians/7/slug",
        );
    });
});
