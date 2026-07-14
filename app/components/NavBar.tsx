"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Menu,
  X
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
  SidebarMenuButton,
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTitle
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SheetClose,
} from "@/components/ui/sheet";
import { useState } from "react";

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
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleNavigation = (href: string) => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden p-3 rounded-md hover:bg-accent hover:text-accent-foreground mr-2 mt-2"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

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
              <DropdownMenu>
                <DropdownMenuTrigger >
                  <button className="ml-auto p-1 rounded-md hover:bg-accent">
                    <LogOut className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Sheet
                    // onConfirm={() => {
                    //   localStorage.clear();
                    //   window.location.href = "/login";
                    // }}
                    >
                      <SheetContent className="w-[300px] sm:w-[400px]">
                        <SheetHeader>
                          <SheetTitle>Are you sure?</SheetTitle>
                        </SheetHeader>
                        <p className="text-sm text-muted-foreground mt-2">
                          Log out? This will redirect you to the login page.
                        </p>
                      </SheetContent>
                    </Sheet>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
