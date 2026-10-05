import Link from "next/link";
import { CheckCircle2, MailWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppPaths } from "@/enums/AppPaths";

/**
 * Landing page for Better Auth's email-verification callback. On success the
 * user arrives already signed in (autoSignInAfterVerification); on failure the
 * verify-email endpoint redirects here with `?error=<code>`.
 */
export default async function EmailVerifiedPage(props: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await props.searchParams;

    return (
        <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-sm">
                {error ? (
                    <>
                        <CardHeader className="items-center gap-3 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                <MailWarning className="h-7 w-7" />
                            </span>
                            <CardTitle className="text-xl">Verification failed</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                This verification link is invalid or has expired. Try
                                signing in to request a new one.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                nativeButton={false}
                                render={<Link href={AppPaths.LOGIN} />}
                            >
                                Go to sign in
                            </Button>
                        </CardContent>
                    </>
                ) : (
                    <>
                        <CardHeader className="items-center gap-3 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <CheckCircle2 className="h-7 w-7" />
                            </span>
                            <CardTitle className="text-xl">Email verified</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Your email address is confirmed and you&apos;re signed in.
                                You&apos;re all set.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                nativeButton={false}
                                render={<Link href={AppPaths.DASHBOARD} />}
                            >
                                Go to dashboard
                            </Button>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
