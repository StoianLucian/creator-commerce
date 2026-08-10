import { notFound } from "next/navigation";

import { parseHandle } from "@/lib/handle";

export default async function HandlerLayout({
    children,
    params,
}: LayoutProps<"/[handler]">) {
    const { handler } = await params;

    if (!parseHandle(handler)) {
        notFound();
    }

    return <>{children}</>;
}
