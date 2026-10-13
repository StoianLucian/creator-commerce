import { PageLoader } from "@/app/components/PageLoader";

// Shown in the (app) content area (sidebar + top bar stay) while any app
// route segment loads.
export default function Loading() {
    return <PageLoader className="min-h-[70vh]" />;
}
