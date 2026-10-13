import { NavBar } from '@/app/components/NavBar'
import { ReactNode } from 'react'
import TopBar from '../ui/top-bar'
import { getSession } from '@/lib/session'

async function AppLayout({ children }: { children: ReactNode }) {
    const session = await getSession()
    const isSignedIn = !!session

    const user = !session ? { name: "", email: "", username: null, image: null } : {
        name: session.user.displayUsername ?? session.user.name,
        email: session.user.email,
        username: session.user.username ?? null,
        image: session.user.image ?? null,
    }

    return (
        <div className="flex h-svh w-full overflow-hidden bg-background">
            <NavBar user={user} isSignedIn={isSignedIn} />

            <div className="flex min-w-0 flex-1 flex-col">
                <TopBar user={user} isSignedIn={isSignedIn} />
                {/* Only this area scrolls, so the sidebar and top bar stay put. */}
                <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    )
}

export default AppLayout
