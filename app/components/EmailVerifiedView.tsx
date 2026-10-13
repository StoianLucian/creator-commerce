"use client";

import Link from "next/link";
import { CheckCircle2, MailWarning } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppPaths } from "@/enums/AppPaths";

/** Translated success/failure card for the email-verification callback. */
export function EmailVerifiedView({ hasError }: { hasError: boolean }) {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-sm">
                {hasError ? (
                    <>
                        <CardHeader className="items-center gap-3 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                <MailWarning className="h-7 w-7" />
                            </span>
                            <CardTitle className="text-xl">{t("emailVerified.failedTitle")}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {t("emailVerified.failedDesc")}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                nativeButton={false}
                                render={<Link href={AppPaths.LOGIN} />}
                            >
                                {t("emailVerified.goSignIn")}
                            </Button>
                        </CardContent>
                    </>
                ) : (
                    <>
                        <CardHeader className="items-center gap-3 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <CheckCircle2 className="h-7 w-7" />
                            </span>
                            <CardTitle className="text-xl">{t("emailVerified.verifiedTitle")}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {t("emailVerified.verifiedDesc")}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                nativeButton={false}
                                render={<Link href={AppPaths.DASHBOARD} />}
                            >
                                {t("emailVerified.goDashboard")}
                            </Button>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
