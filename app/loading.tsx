import { PageLoader } from "@/app/components/PageLoader";

// Root-level loading fallback (e.g. the email-verified page and any route
// without a closer loading.tsx).
export default function Loading() {
    return <PageLoader className="min-h-screen" />;
}
