// app/(app)/sales/page.tsx

import AuthGuard from "@/components/auth-guard/AuthGuard";
import SalesList from "@/app/components/SalesList";
import { PageHeading } from "@/app/components/PageHeading";

export const metadata = {
    title: "Sales",
};

export default function SalesPage() {
    return (
        <div className="space-y-6 px-12 py-8">
            <PageHeading
                titleKey="headings.salesTitle"
                subtitleKey="headings.salesSubtitle"
            />

            <AuthGuard>
                <SalesList />
            </AuthGuard>
        </div>
    );
}
