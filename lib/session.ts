// lib/session.ts

import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "./auth";

/**
 * Request-deduplicated session lookup, so the layouts, guards and
 * server actions that all need the current user share one query.
 */
export const getSession = cache(async () =>
    auth.api.getSession({
        headers: await headers(),
    })
);
