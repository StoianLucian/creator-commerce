"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, ShieldCheck, Truck, Sparkles, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppPaths } from "@/enums/AppPaths";

interface AuthFormProps {
  children: ReactNode;
}

const trustItems = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Truck, label: "Order tracking" },
  { icon: Sparkles, label: "Curated by creators" },
];

export default function AuthForm({ children }: AuthFormProps) {
  const pathname = usePathname();

  const isLogin = pathname.includes(AppPaths.LOGIN);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-muted/30 p-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <ShoppingBag className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Creator Commerce</h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Sign in to pick up where you left off"
                : "Create an account and start shopping"}
            </p>
          </div>
        </div>

        {children}

        <Button
          variant="outline"
          className="w-full"
          nativeButton={false}
          render={<Link href={AppPaths.DASHBOARD} />}
        >
          <Store className="mr-2 h-4 w-4" />
          Continue browsing as guest
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "New to Creator Commerce? " : "Already have an account? "}
          <Link
            href={isLogin ? AppPaths.REGISTER : AppPaths.LOGIN}
            className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {trustItems.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </span>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
