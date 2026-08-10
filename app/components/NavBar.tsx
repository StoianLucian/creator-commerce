"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings
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

import { useState } from "react";
import { AppPaths, CreatorPaths } from "@/enums/AppPaths";
import { toHandle } from "@/lib/handle";

interface NavBarProps {
  user: {
    name: string;
    email: string;
    username: string | null;
    image: string | null;
  };
}

export const NavBar = ({ user }: NavBarProps) => {
  const pathname = usePathname();

  const loggedInItems = [
    // Products live under the creator's own handle: /@handle/products
    ...(user.username
      ? [{ name: "Products", href: CreatorPaths.products(user.username), icon: Package }]
      : []),
  ];

  const guestItems = [
    { name: "Explore", href: AppPaths.DASHBOARD, icon: LayoutDashboard },
  ]

  return (
    <>


      {/* Sidebar */}
      <Sidebar
        // open={isMobileOpen}
        // onOpenChange={setIsMobileOpen}
        collapsible="none"
      >
        <SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel>NEXT APP</SidebarGroupLabel>
            <div className="flex items-center gap-2 p-1">
              <Avatar className="h-8 w-8">
                {user.image && <AvatarImage src={user.image} />}
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.username ? toHandle(user.username) : user.email}
                </span>
              </div>
            </div>
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>My section</SidebarGroupLabel>
            <SidebarGroupContent>
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
