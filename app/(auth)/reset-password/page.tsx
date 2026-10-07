import { ResetPasswordForm } from "@/app/components/ResetPasswordForm"

// Better Auth's reset callback redirects here with `?token=...` on success, or
// `?error=INVALID_TOKEN` (no token) when the link is bad or expired.
async function ResetPassword({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>
}) {
    const { token } = await searchParams

    return (
        <ResetPasswordForm token={token} />
    )
}

export default ResetPassword
