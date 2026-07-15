import AppLayout from "@/components/app-layout/AppLayout";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppPaths } from "@/enums/AppPaths";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect(AppPaths.LOGIN);
    }


    return <AppLayout>{children}</AppLayout>;
}