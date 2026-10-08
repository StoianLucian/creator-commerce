import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
    it("joins truthy class names", () => {
        expect(cn("a", "b")).toBe("a b");
    });

    it("drops falsy values", () => {
        expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
    });

    it("supports conditional object syntax", () => {
        expect(cn("base", { active: true, hidden: false })).toBe("base active");
    });

    it("merges conflicting tailwind utilities, last one winning", () => {
        expect(cn("p-2", "p-4")).toBe("p-4");
        expect(cn("text-sm", "text-lg")).toBe("text-lg");
    });

    it("keeps non-conflicting tailwind utilities", () => {
        expect(cn("px-2", "py-4")).toBe("px-2 py-4");
    });
});
