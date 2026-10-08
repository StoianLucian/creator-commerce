import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// `server-only` / `client-only` are not real packages — Next.js resolves them
// via build-time aliases. Vitest has no such alias, and the specifier fails to
// resolve before a `vi.mock` can intercept it, so point them at an empty stub.
const emptyModule = fileURLToPath(new URL("./test/stubs/empty-module.ts", import.meta.url));

export default defineConfig({
    resolve: {
        // Resolve the `@/*` path alias from tsconfig.json natively, so tests
        // import modules the same way the app does.
        tsconfigPaths: true,
        alias: {
            "server-only": emptyModule,
            "client-only": emptyModule,
        },
    },
    test: {
        // jsdom is a superset of node for our purposes: the pure-logic suites
        // run fine in it, and component/hook suites get a DOM.
        environment: "jsdom",
        setupFiles: ["./vitest.setup.ts"],
        include: ["**/*.test.ts", "**/*.test.tsx"],
        exclude: ["node_modules", ".next"],
    },
});
