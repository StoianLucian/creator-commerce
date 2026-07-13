"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppPaths } from "@/enums/AppPaths";

interface AuthForm {
  children: ReactNode
}

export default function AuthForm({ children }: AuthForm) {

  const pathname = usePathname();

  const isLogin = pathname.includes(AppPaths.LOGIN)

  console.log(isLogin)

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex min-h-screen w-full">
        {/* Left background panel */}
        <div className="relative w-1/2 min-h-screen flex flex-col justify-center overflow-hidden">
          {/* Dynamic gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-ae79d053153c?w=2000')] bg-cover bg-center opacity-20" />
          </div>

          {/* Animated patterns */}
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* Content overlay */}
          <div className="relative z-10 p-8 md:p-12">
            <div className="max-w-md mx-auto w-full">
              {/* Logo/Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3-3" />
                    <path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path d="M12 16v.01" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h1>
                <p className="text-white/70">
                  Sign in to continue to your account
                </p>
              </div>

              {/* Login Form */}
              <div className="mb-6">
                {children}
              </div>

              <Separator className="bg-white/20" />

              {/* Additional options */}
              <div className="flex items-center justify-between text-white/80 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/30 bg-white/20 text-white/90 focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/50" />
                  <span>Remember me</span>
                </label>
                <a
                  href="/forgot-password"
                  className="font-medium hover:text-white transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <Separator className="bg-white/20 my-6" />

              {isLogin ? <Alert className="bg-white/10 border-white/20 text-white/80">
                <AlertDescription className="text-white/90">
                  Don't have an account?
                  <a
                    href={`${AppPaths.REGISTER}`}
                    className="font-medium underline underline-offset-4 hover:text-white"
                  >
                    Create one now
                  </a>
                </AlertDescription>
              </Alert> : <Alert className="bg-white/10 border-white/20 text-white/80">
                <AlertDescription className="text-white/90">
                  Already have an account?
                  <a
                    href={`${AppPaths.LOGIN}`}
                    className="font-medium underline underline-offset-4 hover:text-white"
                  >
                    Click here to login
                  </a>
                </AlertDescription>
              </Alert>
              }
              {/* Footer */}
              <div className="mt-6 text-center text-white/50 text-xs">
                <p>
                  By continuing, you agree to our{" "}
                  <a
                    href="/terms"
                    className="underline hover:text-white/70"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="underline hover:text-white/70"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right content panel */}
        <div className="hidden lg:flex w-1/2 min-h-screen items-center justify-center bg-muted/50 p-6 lg:p-12">
          <div className="max-w-md w-full">
            {/* Illustration Card */}
            <Card className="bg-background border border-muted/50 shadow-xl">
              <div className="p-8">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
                  <div className="w-40 h-40 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl opacity-20 animate-pulse" />
                    <div className="absolute inset-2 bg-gradient-to-br from-primary to-accent rounded-xl opacity-30" />
                    <div className="absolute inset-6 bg-gradient-to-br from-primary to-accent rounded-lg opacity-40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3-3" />
                        <path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        <path d="M12 16v.01" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-muted/50 border border-muted">
                    <h3 className="font-semibold text-foreground mb-2">
                      Secure Login
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your account is protected with industry-standard encryption
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-muted">
                    <h3 className="font-semibold text-foreground mb-2">
                      Fast Access
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in quickly and securely with your credentials
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile loader */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    </div>
  );
}