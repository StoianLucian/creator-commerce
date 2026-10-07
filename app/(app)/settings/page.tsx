// app/(app)/settings/page.tsx

import { redirect } from "next/navigation";

import { AppPaths } from "@/enums/AppPaths";
import { getSession } from "@/lib/session";
import { SettingsForm } from "@/app/components/SettingsForm";

export const metadata = {
    title: "Settings",
};

export default async function SettingsPage() {
    const session = await getSession();

    if (!session) {
        redirect(AppPaths.LOGIN);
    }

    const user = {
        name: session.user.displayUsername ?? session.user.name,
        username: session.user.username ?? "",
        email: session.user.email,
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 px-12 py-8">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account details and password.
                </p>
            </div>

            <SettingsForm user={user} />
        </div>
    );
}
