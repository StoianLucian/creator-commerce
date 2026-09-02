// app/(app)/orders/page.tsx

import { Suspense } from "react";

import AuthGuard from "@/components/auth-guard/AuthGuard";
import { OrderHistory } from "@/components/orders/OrderHistory";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
    title: "Orders",
};

export default function OrdersPage() {
    return (
        <div className="space-y-6 px-12 py-8">
            <div>
                <h1 className="text-3xl font-bold">Orders</h1>
                <p className="text-muted-foreground">
                    Everything you have bought, newest first.
                </p>
            </div>

            <AuthGuard>
                <Suspense
                    fallback={
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-36 rounded-lg" />
                            ))}
                        </div>
                    }
                >
                    <OrderHistory />
                </Suspense>
            </AuthGuard>
        </div>
    );
}
