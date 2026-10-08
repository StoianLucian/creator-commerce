import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount anything a test rendered so suites don't leak DOM into each other.
afterEach(() => {
    cleanup();
});
