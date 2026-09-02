import AppLayout from "@/components/app-layout/AppLayout";

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