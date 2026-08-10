import { notFound } from "next/navigation";

import { getSession } from "@/lib/session";
import { parseHandle } from "@/lib/handle";
import AuthGuard from "@/components/auth-guard/AuthGuard";

export default async function HandlerLayout({
    children,
    params,
}: LayoutProps<"/[handler]">) {
    const { handler } = await params;
    const username = parseHandle(handler);

    const session = await getSession();

    if (!username || username !== session?.user.username) {
        notFound();
    }

    return <AuthGuard>{children}</AuthGuard>;
}
