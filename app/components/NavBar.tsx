"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Receipt,
  TrendingUp

} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppPaths, CreatorPaths } from "@/enums/AppPaths";
import { toHandle } from "@/lib/handle";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

interface NavBarProps {
  user: {
    name: string;
    email: string;
    username: string | null;
    image: string | null;
  };
  /** The sidebar also renders for guests, who get the Explore group only. */
  isSignedIn: boolean;
}

export const NavBar = ({ user, isSignedIn }: NavBarProps) => {
  const pathname = usePathname();

  const loggedInItems = isSignedIn
    ? [
      // Products live under the creator's own handle: /@handle/products
      ...(user.username
        ? [{ name: "Products", href: CreatorPaths.products(user.username), icon: Package }]
        : []),
      { name: "Orders", href: AppPaths.ORDERS, icon: Receipt },
      { name: "Sales", href: AppPaths.SALES, icon: TrendingUp },
    ]
    : [];

  const guestItems = [
    { name: "Explore", href: AppPaths.DASHBOARD, icon: LayoutDashboard },
  ]

  return (
    <>
      <Sidebar
        collapsible="none"
      >
        <SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel>NEXT APP</SidebarGroupLabel>
            <div className="flex items-center gap-2 p-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>{initialsOf(user.name) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.username ? toHandle(user.username) : user.email}
                </span>
              </div>
            </div>
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              {loggedInItems.length > 0 && (
                <>
                  <SidebarGroupLabel>My section</SidebarGroupLabel>
                  <SidebarMenu>
                    {loggedInItems.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          isActive={pathname === item.href}
                        >
                          <Link href={item.href} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </>
              )}
              <SidebarGroupLabel>Explore</SidebarGroupLabel>
              <SidebarMenu>
                {guestItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
};
