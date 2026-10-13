"use client";

import { Button } from "@/components/ui/button";
import { AppPaths } from "@/enums/AppPaths";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next";

export function LogoutButton() {

    const router = useRouter()
    const { t } = useTranslation();

    async function handleLogout() {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.replace(AppPaths.LOGIN);
                        // Clear the Router Cache so the server layout drops the
                        // signed-in UI immediately (no manual refresh needed).
                        router.refresh();
                    },
                },
            });
        } catch (error) {
            console.error("Failed to sign out", error)
        }
    }

    return (
        <Button
            variant="ghost"
            onClick={() => handleLogout()}
        >
            <LogOutIcon className="mr-2 h-4 w-4" />
            {t("logout.label")}
        </Button>
    );
}
