import { PageLoader } from "@/app/components/PageLoader";

// Loading fallback for the auth pages (login, register, password flows).
export default function Loading() {
    return <PageLoader className="min-h-screen" />;
}
