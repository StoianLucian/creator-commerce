// lib/data/creators.ts

import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import { user } from "@/src/db/auth-schema";
import { getSession } from "@/lib/session";

/**
 * Resolves a `@handle` username to its creator, so public routes can 404 on
 * handles nobody owns without needing a session.
 *
 * Request-deduplicated: a layout and its page share one query.
 */
export const getCreatorByUsername = cache(async (username: string) => {
    const found = await db.query.user.findFirst({
        where: eq(user.username, username),
        columns: {
            id: true,
            name: true,
            username: true,
            displayUsername: true,
            image: true,
        },
    });

    return found ?? null;
});

/** True when the signed-in user owns this handle. */
export async function isHandleOwner(username: string) {
    const session = await getSession();

    return session?.user?.username === username;
}
