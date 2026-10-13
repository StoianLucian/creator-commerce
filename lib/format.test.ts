import { describe, expect, it } from "vitest";

import { dateFormatter, priceFormatter } from "@/lib/format";

describe("priceFormatter", () => {
    it("formats whole lei with a lei suffix and no fractional digits", () => {
        // ro-RO uses "." as the thousands separator and a non-breaking space
        // ( ) before the "lei" symbol.
        expect(priceFormatter.format(1000)).toBe("1.000 lei");
        expect(priceFormatter.format(0)).toBe("0 lei");
    });

    it("rounds away any fractional part (prices are whole lei)", () => {
        expect(priceFormatter.format(9.99)).toBe("10 lei");
    });
});

describe("dateFormatter", () => {
    it("renders a medium date in UTC, independent of the host timezone", () => {
        // 2026-01-02T00:00:00Z — a fixed UTC timezone keeps server and client
        // output identical regardless of where the test runs.
        const date = new Date("2026-01-02T00:00:00.000Z");
        expect(dateFormatter.format(date)).toBe("Jan 2, 2026");
    });
});
