// app/(app)/checkout/cancel/page.tsx

import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppPaths } from "@/enums/AppPaths";

export default function CheckoutCancelPage() {
    return (
        <div className="mx-auto max-w-xl space-y-6 p-6 text-center">
            <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />

            <div className="space-y-1">
                <h1 className="text-2xl font-bold">Checkout canceled</h1>
                <p className="text-muted-foreground">
                    Nothing was charged. Your cart is still waiting for you.
                </p>
            </div>

            {/* `nativeButton={false}`: the rendered element is an <a>, not a <button>. */}
            <Button nativeButton={false} render={<Link href={AppPaths.DASHBOARD} />}>
                Back to shopping
            </Button>
        </div>
    );
}
