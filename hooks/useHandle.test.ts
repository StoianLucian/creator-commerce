import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({
    state: { params: {} as Record<string, string | undefined> },
}));

vi.mock("next/navigation", () => ({
    useParams: () => state.params,
}));

import { useHandle } from "@/hooks/useHandle";

describe("useHandle", () => {
    beforeEach(() => {
        state.params = {};
    });

    it("parses the username and handle from a valid segment", () => {
        state.params = { handler: "@lucians" };

        const { result } = renderHook(() => useHandle());

        expect(result.current).toEqual({ username: "lucians", handle: "@lucians" });
    });

    it("lowercases the username", () => {
        state.params = { handler: "@Lucians" };

        const { result } = renderHook(() => useHandle());

        expect(result.current.username).toBe("lucians");
        expect(result.current.handle).toBe("@lucians");
    });

    it("decodes a percent-encoded @ prefix", () => {
        state.params = { handler: "%40bob" };

        const { result } = renderHook(() => useHandle());

        expect(result.current).toEqual({ username: "bob", handle: "@bob" });
    });

    it("throws when the segment is not an @handle", () => {
        state.params = { handler: "lucians" };

        expect(() => renderHook(() => useHandle())).toThrow(
            /useHandle must be used inside a \/\[handler\] route/
        );
    });

    it("throws when the handler segment is missing", () => {
        state.params = {};

        expect(() => renderHook(() => useHandle())).toThrow();
    });
});
