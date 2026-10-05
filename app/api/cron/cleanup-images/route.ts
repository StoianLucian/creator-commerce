import { NextRequest, NextResponse } from "next/server";

import { deleteOrphanedImages } from "@/lib/maintenance/orphaned-images";

/**
 * Scheduled cleanup of UploadThing files no product references (see
 * vercel.json for the schedule). Vercel Cron invokes this with an
 * `Authorization: Bearer ${CRON_SECRET}` header it injects automatically when
 * CRON_SECRET is set on the project, so the endpoint stays non-public.
 */
export async function GET(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET;

    // Refuse to run unauthenticated: without a configured secret the check
    // below would compare against "Bearer undefined" and could pass.
    if (!cronSecret) {
        console.error("CRON_SECRET is not set — refusing to run cleanup.");
        return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const result = await deleteOrphanedImages();
        console.log("[cron] orphaned image cleanup", result);
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error("[cron] orphaned image cleanup failed", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
