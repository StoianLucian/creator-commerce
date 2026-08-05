import { redirect } from "next/navigation";
import { AppPaths } from "@/enums/AppPaths";
import { getSession } from "@/lib/session";

export default async function AuthGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect(AppPaths.LOGIN);
    }

    return <>{children}</>;
}
