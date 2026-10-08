import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIsMobile } from "@/hooks/use-mobile";

type ChangeHandler = () => void;

let changeHandlers: ChangeHandler[];

function setWidth(width: number) {
    Object.defineProperty(window, "innerWidth", {
        configurable: true,
        writable: true,
        value: width,
    });
}

function installMatchMedia() {
    changeHandlers = [];
    const matchMedia = vi.fn((query: string) => ({
        matches: window.innerWidth < 768,
        media: query,
        addEventListener: (_event: string, handler: ChangeHandler) => {
            changeHandlers.push(handler);
        },
        removeEventListener: (_event: string, handler: ChangeHandler) => {
            changeHandlers = changeHandlers.filter((h) => h !== handler);
        },
    }));
    Object.defineProperty(window, "matchMedia", {
        configurable: true,
        writable: true,
        value: matchMedia,
    });
}

describe("useIsMobile", () => {
    beforeEach(() => {
        installMatchMedia();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns true when the viewport is below the breakpoint", () => {
        setWidth(500);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it("returns false when the viewport is at or above the breakpoint", () => {
        setWidth(1024);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it("always returns a boolean (never undefined)", () => {
        setWidth(1024);
        const { result } = renderHook(() => useIsMobile());
        expect(typeof result.current).toBe("boolean");
    });

    it("updates when the media query change event fires", () => {
        setWidth(1024);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        act(() => {
            setWidth(400);
            changeHandlers.forEach((handler) => handler());
        });

        expect(result.current).toBe(true);
    });

    it("removes its change listener on unmount", () => {
        setWidth(500);
        const { unmount } = renderHook(() => useIsMobile());
        expect(changeHandlers.length).toBe(1);
        unmount();
        expect(changeHandlers.length).toBe(0);
    });
});
