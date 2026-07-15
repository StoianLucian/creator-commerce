import { NavBar } from '@/app/components/NavBar'
import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'
import TopBar from '../ui/top-bar'

function AppLayout({ children }: any) {
    return (
        <div className={cn("flex flex-1")}>
            <div>
                <NavBar />
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