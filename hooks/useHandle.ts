"use client";

import { useParams } from "next/navigation";

import { parseHandle, toHandle } from "@/lib/handle";

/**
 * Reads the `[handler]` segment of the current route.
 *
 * Only usable inside `/[handler]/*`; the layout there guarantees the
 * segment is a valid @handle belonging to the signed-in user.
 */
export function useHandle() {
    const { handler } = useParams<{ handler: string }>();

    const username = parseHandle(handler ?? "");

    if (!username) {
        throw new Error("useHandle must be used inside a /[handler] route");
    }

    return { username, handle: toHandle(username) };
}
