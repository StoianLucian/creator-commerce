"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { TogglePasswordInput } from "@/app/components/InputComponent";
import { AppPaths } from "@/enums/AppPaths";
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
      setError(result.error.message ?? "Invalid username or password")
      return
    }

    router.push(AppPaths.DASHBOARD)
  }

  return (
    <Card className="w-100">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <p className="text-sm text-muted-foreground">
          Please enter your credentials to continue
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
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
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
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
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}