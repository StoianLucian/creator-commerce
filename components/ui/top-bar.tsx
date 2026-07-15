import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Input } from "@/components/ui/input"
import {
  BellIcon,
  SearchIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  HelpCircleIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAVIGATION_ITEMS = [
  { title: "Dashboard", description: "Overview of your activity", href: "/dashboard" },
  { title: "Projects", description: "Manage your projects", href: "/projects" },
  { title: "Team", description: "Collaborate with your team", href: "/team" },
  { title: "Analytics", description: "View your metrics", href: "/analytics" },
]

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

export function TopBar({ className = "", onNotificationClick, rightMenuItems }: TopBarProps) {
  return (
    <header
      className={cn(
        "w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium shadow-sm">
            <span className="text-lg font-bold">Brand</span>
          </div>

          {/* <NavigationMenu>
            <NavigationMenuList>
              {NAVIGATION_ITEMS.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuTrigger>
                    <span
                      // variant="ghost"
                      className={cn("gap-1.5 font-normal", item.href === "/dashboard" && "text-foreground")}
                    >
                      {item.title}
                    </span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu> */}
        </div>

        {/* Center: Search */}

        <div className=" hidden lg:block">
          <div className={cn("flex")}>
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 max-w-60 lg:w-96 h-9"
            />
            <Button variant="ghost" size="icon">
              <SearchIcon className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>



        <div>
          <Button variant="ghost" size="icon">
            <BellIcon className="h-4 w-4" />
            <span className="relative top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger >
              <span className="relative h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user.jpg" alt="User" />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-muted-foreground">john@example.com</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Right: Actions & User */}
        <div className="flex items-center gap-2">
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
                  <span className="font-medium">{item.label}</span>
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