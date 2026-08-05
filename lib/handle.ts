// lib/handle.ts

export const HANDLE_PREFIX = "@";

/** Builds the URL segment for a username: "lucians" -> "@lucians" */
export function toHandle(username: string) {
    return `${HANDLE_PREFIX}${username}`;
}

/**
 * Reads a username out of a `[handler]` route segment.
 * Returns null when the segment isn't an @handle, so callers can 404.
 *
 * better-auth's username plugin lowercases usernames on write, so we
 * normalize here too and keep the URL case-insensitive.
 */
export function parseHandle(segment: string) {
    // Browsers percent-encode "@" in paths, so the raw segment can arrive
    // as "%40lucians" — decode before looking for the prefix.
    let decoded: string;
    try {
        decoded = decodeURIComponent(segment);
    } catch {
        return null;
    }

    if (!decoded.startsWith(HANDLE_PREFIX)) return null;

    const username = decoded.slice(HANDLE_PREFIX.length).toLowerCase();

    return username.length > 0 ? username : null;
}
