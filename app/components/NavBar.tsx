"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Heart,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
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
  const { t } = useTranslation();

  const loggedInItems = isSignedIn
    ? [
      // Products live under the creator's own handle: /@handle/products
      ...(user.username
        ? [{ key: "products", name: t("nav.products"), href: CreatorPaths.products(user.username), icon: Package }]
        : []),
      { key: "orders", name: t("nav.orders"), href: AppPaths.ORDERS, icon: Receipt },
      { key: "sales", name: t("nav.sales"), href: AppPaths.SALES, icon: TrendingUp },
      { key: "settings", name: t("nav.settings"), href: AppPaths.SETTINGS, icon: Settings },
    ]
    : [];

  const guestItems = [
    { key: "explore", name: t("nav.explore"), href: AppPaths.DASHBOARD, icon: LayoutDashboard },
    { key: "wishlist", name: t("nav.wishlist"), href: AppPaths.WISHLIST, icon: Heart },
  ]

  return (
    <>
      <Sidebar
        collapsible="none"
      >
        <SidebarHeader>
          <SidebarGroup>
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
                  <SidebarGroupLabel>{t("nav.mySection")}</SidebarGroupLabel>
                  <SidebarMenu>
                    {loggedInItems.map((item) => (
                      <SidebarMenuItem key={item.key}>
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
              <SidebarGroupLabel>{t("nav.explore")}</SidebarGroupLabel>
              <SidebarMenu>
                {guestItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
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
