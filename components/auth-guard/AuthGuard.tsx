// components/AuthGuard.tsx (Server Component)
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    console.log(session)

    if (!session) {
        redirect("/login");
    }

    return <>{children}</>;
}