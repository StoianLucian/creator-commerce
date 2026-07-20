import AppLayout from "@/components/app-layout/AppLayout";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppPaths } from "@/enums/AppPaths";
import AuthGuard from "@/components/auth-guard/AuthGuard";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <AuthGuard>
            <AppLayout>
                {children}
            </AppLayout>
        </AuthGuard>
    )
}