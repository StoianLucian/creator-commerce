import { EmailVerifiedView } from "@/app/components/EmailVerifiedView";

/**
 * Landing page for Better Auth's email-verification callback. On success the
 * user arrives already signed in (autoSignInAfterVerification); on failure the
 * verify-email endpoint redirects here with `?error=<code>`.
 */
export default async function EmailVerifiedPage(props: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await props.searchParams;

    return <EmailVerifiedView hasError={Boolean(error)} />;
}
