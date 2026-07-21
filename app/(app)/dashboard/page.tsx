"use client"

import { cn } from "@/lib/utils";
import Dashboard from "@/app/components/Dashboard";


export default function Home() {

    return (
        <div className={cn("flex flex-col items-center justify-center h-screen bg-gray-100")}>
            <Dashboard />
        </div>
    );
}
