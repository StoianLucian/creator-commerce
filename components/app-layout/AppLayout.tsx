import { NavBar } from '@/app/components/NavBar'
import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'
import TopBar from '../ui/top-bar'
import { getSession } from '@/lib/session'
import { email } from 'zod'

async function AppLayout({ children }: { children: ReactNode }) {
    // AuthGuard above guarantees a session here.
    const session = await getSession()

    const user = !session ? { name: "", email: "", username: null, image: null } : {
        name: session!.user.displayUsername ?? session!.user.name,
        email: session!.user.email,
        username: session!.user.username ?? null,
        image: session!.user.image ?? null,
    }

    return (
        <div className={cn("flex flex-1")}>
            <div>
                <NavBar user={user} />
            </div>
            <div className={cn("flex-col flex-1")}>
                <TopBar />
                <main>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default AppLayout
