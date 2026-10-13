import type { TFunction } from "i18next";

/**
 * Translates a seeded category name via the `categories` namespace, falling
 * back to the raw name for any category without a translation (e.g. ones a
 * creator adds later).
 */
export function categoryLabel(t: TFunction, name: string): string {
    return t(`categories.${name}`, { defaultValue: name });
}
