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
import useAuth from "../context/AuthContext";
import { AppPaths } from "@/enums/AppPaths";

export const NavBar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Mock user - replace with actual authenticated user
  const user = {
    name: "User",
    email: "user@example.com",
    avatar: "https://github.com/shadcn.png"
  };

  const navigation = [
    { name: "Dashboard", href: AppPaths.DASHBOARD, icon: LayoutDashboard },
    { name: "Products", href: AppPaths.PRODUCTS, icon: Package },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleNavigation = (href: string) => {
    setIsMobileOpen(false);
  };

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
                <AvatarImage src={user.avatar} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href} onClick={() => handleNavigation(item.href)}>
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
