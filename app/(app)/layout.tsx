import AppLayout from "@/components/app-layout/AppLayout";
import AuthGuard from "@/components/auth-guard/AuthGuard";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <AppLayout>
            {children}
        </AppLayout>
    )
}