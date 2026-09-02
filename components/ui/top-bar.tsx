"use client";

import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Store, SettingsIcon, UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AppPaths } from "@/enums/AppPaths"
import { toHandle } from "@/lib/handle"
import { LogoutButton } from "../logount-button/LogoutButton"
import { CartSheet } from "../cart/CartSheet"

interface TopBarUser {
  name: string
  email: string
  username: string | null
  image: string | null
}

interface TopBarProps {
  className?: string
  user?: TopBarUser
  isSignedIn?: boolean
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}

export function TopBar({ className, user, isSignedIn }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        className
      )}
    >
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <Link
          href={AppPaths.DASHBOARD}
          className="flex items-center gap-2 rounded-lg px-1 py-1 font-semibold transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">Creator Commerce</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
          <CartSheet />

          {isSignedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Open account menu"
                  />
                }
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback>
                    {initialsOf(user.name) || <UserIcon className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col gap-0.5 px-2 py-1.5">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.username ? toHandle(user.username) : user.email}
                  </span>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="p-0">
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href={AppPaths.LOGIN} />}
              >
                Log in
              </Button>
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href={AppPaths.REGISTER} />}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar
