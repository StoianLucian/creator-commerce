"use client"

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppPaths } from "@/enums/AppPaths";
import { LoadingComponent } from "@/components/ui/loading-component";
import Dashboard from "@/app/components/Dashboard";
import useAuth from "@/app/context/AuthContext";


export default function Home() {

    // const { isAuthenticated, isLoading } = useAuth();
    // const router = useRouter();

    // useEffect(() => {
    //     if (!isLoading && !isAuthenticated) {
    //         router.replace(AppPaths.LOGIN);
    //     }
    // }, [isAuthenticated, isLoading, router]);

    // if (isLoading) return <LoadingComponent />;
    // if (!isAuthenticated) return null;

    return (
        <div className={cn("flex flex-col items-center justify-center h-screen bg-gray-100")}>
            <Dashboard />
        </div>
    );
}
