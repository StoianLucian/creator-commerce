import { NavBar } from '@/app/components/NavBar'
import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

function AppLayout({ children }: any) {
    return (
        <div className={cn("flex")}>
            <div>
                <NavBar />
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}

export default AppLayout