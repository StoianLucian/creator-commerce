import { describe, expect, it } from "vitest";

import { HANDLE_PREFIX, parseHandle, toHandle } from "@/lib/handle";

describe("toHandle", () => {
    it("prefixes a username with @", () => {
        expect(toHandle("lucians")).toBe("@lucians");
    });

    it("uses HANDLE_PREFIX", () => {
        expect(toHandle("x").startsWith(HANDLE_PREFIX)).toBe(true);
    });
});

describe("parseHandle", () => {
    it("reads the username out of an @handle", () => {
        expect(parseHandle("@lucians")).toBe("lucians");
    });

    it("decodes a percent-encoded @ (%40)", () => {
        expect(parseHandle("%40lucians")).toBe("lucians");
    });

    it("lowercases the username to match better-auth's normalization", () => {
        expect(parseHandle("@Lucians")).toBe("lucians");
        expect(parseHandle("%40LUCIANS")).toBe("lucians");
    });

    it("returns null when the segment is not an @handle", () => {
        expect(parseHandle("lucians")).toBeNull();
        expect(parseHandle("dashboard")).toBeNull();
    });

    it("returns null for an empty username after the prefix", () => {
        expect(parseHandle("@")).toBeNull();
        expect(parseHandle("%40")).toBeNull();
    });

    it("returns null for malformed percent-encoding instead of throwing", () => {
        expect(parseHandle("%")).toBeNull();
        expect(parseHandle("%ZZ")).toBeNull();
    });
});
