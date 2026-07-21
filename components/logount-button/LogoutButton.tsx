// components/logout-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { AppPaths } from "@/enums/AppPaths";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation"

export function LogoutButton() {

    const router = useRouter()

    async function handleLogout() {
        console.log("click")
        try {
            const logout = await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        console.log("success")
                        router.replace(AppPaths.LOGIN);
                    },
                },
            });
        } catch (error) {

        }
    }
    return (
        <Button
            variant="ghost"
            onClick={() => {
                handleLogout()
            }}
        >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Log out
        </Button>
    );
}