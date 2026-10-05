import { UTApi } from "uploadthing/server";
import { db } from "../../src/db";
import { productImages } from "../../src/db/product-images-schema";

// UTApi reads UPLOADTHING_TOKEN from the environment automatically.
const utapi = new UTApi();

// UploadThing's listFiles endpoint caps a page at 500 files.
const PAGE_SIZE = 500;

// A file lands in UploadThing (onUploadComplete) *before* createProduct /
// updateProduct writes its product_images row, so a just-uploaded file can
// legitimately have no DB reference yet. Skip anything newer than this so the
// cleanup never races an in-flight upload.
const DEFAULT_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

export type DeleteOrphanedImagesResult = {
    /** UploadThing files inspected. */
    scanned: number;
    /** Files identified as orphans (past the grace period, unreferenced). */
    orphaned: number;
    /** Files UploadThing reported as actually deleted (0 on a dry run). */
    deletedCount: number;
    /** The orphan keys. */
    keys: string[];
};

/**
 * Deletes images from UploadThing storage that no product references.
 *
 * The `product_images` table is the source of truth: any file whose key still
 * appears in a row is kept — including soft-deleted products, whose rows are
 * intentionally preserved for order history. Orphans are the storage-only
 * leftovers created when `updateProduct` swaps a product's images (it drops the
 * old rows but not the underlying files) or when an upload is abandoned before
 * the product is saved.
 */
export async function deleteOrphanedImages(options?: {
    /** Ignore files uploaded within this many ms (default 24h). */
    gracePeriodMs?: number;
    /** Report orphans without deleting them. */
    dryRun?: boolean;
}): Promise<DeleteOrphanedImagesResult> {
    const gracePeriodMs = options?.gracePeriodMs ?? DEFAULT_GRACE_PERIOD_MS;
    const dryRun = options?.dryRun ?? false;

    // Every key still referenced by a product image row.
    const rows = await db
        .select({ imageKey: productImages.imageKey })
        .from(productImages);
    const referenced = new Set(rows.map((r) => r.imageKey));

    const cutoff = Date.now() - gracePeriodMs;

    const orphanKeys: string[] = [];
    let scanned = 0;
    let offset = 0;

    // listFiles is paginated — walk every page.
    for (;;) {
        const { files, hasMore } = await utapi.listFiles({
            limit: PAGE_SIZE,
            offset,
        });

        for (const file of files) {
            scanned++;

            // Only fully-uploaded files are deletion candidates; skip
            // Uploading / Failed / already-pending-deletion.
            if (file.status !== "Uploaded") continue;
            // Honour the grace period for fresh uploads.
            if (file.uploadedAt > cutoff) continue;
            // Keep anything a product still points at.
            if (referenced.has(file.key)) continue;

            orphanKeys.push(file.key);
        }

        // Stop when the last page is reached (or the cursor stops advancing).
        if (!hasMore || files.length === 0) break;
        offset += files.length;
    }

    let deletedCount = 0;
    if (!dryRun && orphanKeys.length > 0) {
        const res = await utapi.deleteFiles(orphanKeys);
        deletedCount = res.deletedCount;
    }

    return { scanned, orphaned: orphanKeys.length, deletedCount, keys: orphanKeys };
}
