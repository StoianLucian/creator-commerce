"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import { AuthProvider } from "../context/AuthContext";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {/* <SidebarProvider> */}
            <AuthProvider>
                {children}
            </AuthProvider>
            {/* </SidebarProvider> */}
        </QueryClientProvider>
    );
}