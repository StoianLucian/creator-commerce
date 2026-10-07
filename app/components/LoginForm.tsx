"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { TogglePasswordInput } from "@/app/components/InputComponent";
import { AppPaths } from "@/enums/AppPaths";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/form-validations/auth";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true)
    const { username, password } = data

    const result = await authClient.signIn.username({
      username,
      password,
    });

    setLoading(false)

    if (result.error) {
      // Sign-in is blocked until the address is verified; point the user at
      // the link we emailed rather than showing a generic credentials error.
      if (result.error.code === "EMAIL_NOT_VERIFIED") {
        setError("Please verify your email before signing in — check your inbox for the verification link.")
        return
      }
      setError(result.error.message ?? "Invalid username or password")
      return
    }

    router.push(AppPaths.DASHBOARD)
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="gap-1.5">
        <CardTitle className="text-xl">Welcome Back</CardTitle>
        <p className="text-sm text-muted-foreground">
          Please enter your credentials to continue
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium leading-none">
                  Username
                </label>

                <Input
                  id="username"
                  placeholder="Enter your username"
                  {...field}
                />

                {error && (
                  <p className="text-sm text-destructive">
                    {error.message}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium leading-none">
                    Password
                  </label>
                  <Link
                    href={AppPaths.FORGOT_PASSWORD}
                    className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <TogglePasswordInput
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />

                {error && (
                  <p className="text-sm text-destructive">
                    {error.message}
                  </p>
                )}
              </div>
            )}
          />
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}