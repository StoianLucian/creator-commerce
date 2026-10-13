"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { AppPaths } from "@/enums/AppPaths";

/**
 * Translated success view for the checkout page. The order summary (a server
 * component) is passed in as `children` so the data fetch stays on the server.
 */
export function CheckoutSuccessView({
    isPaid,
    orderId,
    children,
}: {
    isPaid: boolean;
    orderId: number;
    children: ReactNode;
}) {
    const { t } = useTranslation();

    return (
        <div className="mx-auto max-w-xl space-y-6 p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />

            <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                    {isPaid ? t("checkout.thanksTitle") : t("checkout.receivedTitle")}
                </h1>
                <p className="text-muted-foreground">
                    {isPaid
                        ? t("checkout.confirmedDesc", { id: orderId })
                        : t("checkout.pendingDesc")}
                </p>
            </div>

            <ul className="text-left">{children}</ul>

            <div className="flex items-center justify-center gap-2">
                <Button nativeButton={false} render={<Link href={AppPaths.DASHBOARD} />}>
                    {t("checkout.continueShopping")}
                </Button>
                <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={AppPaths.ORDERS} />}
                >
                    {t("checkout.viewOrders")}
                </Button>
            </div>
        </div>
    );
}
