"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { TogglePasswordInput } from "@/app/components/InputComponent";
import { registerSchema } from "@/form-validations/auth";
import { authClient } from "@/lib/auth-client";
import { AppPaths } from "@/enums/AppPaths";
import { useState } from "react";
import { toast } from "sonner";

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once sign-up succeeds: email verification is required, so there's no
  // session yet — we ask the user to check their inbox instead of redirecting.
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    setError(null);

    const { username, password, email } = data;

    const result = await authClient.signUp.email({
      name: username,
      username,
      email,
      password,
      callbackURL: AppPaths.EMAIL_VERIFIED,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Could not create your account");
      return;
    }

    toast.success(`Verification email sent to ${email}`);
    setVerifyEmail(email);
  }

  if (verifyEmail) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-xl">Check your inbox</CardTitle>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{verifyEmail}</span>.
            Click it to activate your account, then sign in.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="gap-1.5">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <p className="text-sm text-muted-foreground">
          Please enter your details to get started
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
            name="email"
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>

                <Input
                  id="email"
                  placeholder="Enter your email"
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
                <label htmlFor="password" className="text-sm font-medium leading-none">
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
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                  Confirm Password
                </label>
                <TogglePasswordInput
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
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
            Register
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
