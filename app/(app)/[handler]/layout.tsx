import { notFound } from "next/navigation";

import { getSession } from "@/lib/session";
import { parseHandle } from "@/lib/handle";

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

    return <>{children}</>;
}
