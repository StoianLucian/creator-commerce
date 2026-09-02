// app/(app)/sales/page.tsx

import AuthGuard from "@/components/auth-guard/AuthGuard";
import SalesList from "@/app/components/SalesList";

export const metadata = {
    title: "Sales",
};

export default function SalesPage() {
    return (
        <div className="space-y-6 px-12 py-8">
            <div>
                <h1 className="text-3xl font-bold">Sales</h1>
                <p className="text-muted-foreground">
                    Orders for your products, newest first.
                </p>
            </div>

            <AuthGuard>
                <SalesList />
            </AuthGuard>
        </div>
    );
}
