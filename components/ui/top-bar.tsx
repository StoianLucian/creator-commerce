import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  BellIcon,
  SearchIcon,
  UserIcon,
  SettingsIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoutButton } from "../logount-button/LogoutButton"

interface TopBarProps {
  className?: string
  onNotificationClick?: () => void
  rightMenuItems?: {
    key: string
    icon: React.ReactNode
    label: string
    action?: () => void
  }[]
}

export function TopBar({
  className = "",
  onNotificationClick,
  rightMenuItems,
}: TopBarProps) {
  return (
    <header
      className={cn(
        "w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Left */}
        <div className="flex flex-1 items-center">
          <div className="flex h-9 items-center rounded-lg border bg-background px-3 text-sm font-medium shadow-sm">
            <span className="text-lg font-bold">Brand</span>
          </div>
        </div>

        {/* Center */}
        <div className="hidden flex-1 justify-center lg:flex">
          <div className="flex items-center">
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 w-96 max-w-full"
            />
            <Button variant="ghost" size="icon">
              <SearchIcon className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onNotificationClick}
            className="flex h-9 items-center gap-2 px-2"
          >
            <BellIcon className="h-4 w-4" />
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger >
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full p-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/avatars/user.jpg"
                    alt="User"
                  />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    John Doe
                  </span>
                  <span className="text-xs text-muted-foreground">
                    john@example.com
                  </span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <LogoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {rightMenuItems?.map((item) => (
            <DropdownMenu key={item.key} modal>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon">
                  {item.icon}
                  <span className="sr-only">{item.label}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={item.action}>
                  {item.icon}
                  <span>{item.label}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </div>
    </header>
  )
}

export default TopBar