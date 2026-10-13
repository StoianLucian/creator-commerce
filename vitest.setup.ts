import "@testing-library/jest-dom/vitest";
// Initialize the shared i18next instance (default locale `en`) so components
// using `useTranslation()` resolve English strings even without a provider.
import "@/i18n/i18n";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount anything a test rendered so suites don't leak DOM into each other.
afterEach(() => {
    cleanup();
});
