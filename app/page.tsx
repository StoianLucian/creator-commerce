"use client"

import { LoginForm } from "./components/LoginForm";
import { cn } from "@/lib/utils";
import useAuth from "./context/AuthContext";
import { useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { AppPaths } from "@/enums/AppPaths";
import { LoadingComponent } from "@/components/ui/loading-component";
import Dashboard from "./components/Dashboard";

export default function Home() {


  redirect(AppPaths.DASHBOARD)

  return (
    <div className={cn("flex flex-col items-center justify-center h-screen bg-gray-100")}>
      <Dashboard />
    </div>
  );
}
