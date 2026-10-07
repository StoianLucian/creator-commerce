"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TogglePasswordInput } from "@/app/components/InputComponent";
import { AppPaths } from "@/enums/AppPaths";
import { resetPasswordSchema } from "@/form-validations/auth";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    if (!token) return;

    setLoading(true);
    setError(null);

    const result = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Could not reset your password");
      return;
    }

    toast.success("Your password has been reset");
    router.push(AppPaths.LOGIN);
  }

  // Reached without a token (link mistyped, already consumed, or expired at the
  // callback step) — there's nothing to submit against, so steer them to retry.
  if (!token) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-xl">Invalid reset link</CardTitle>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Request a new
            one to continue.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<Link href={AppPaths.FORGOT_PASSWORD} />}
          >
            Request a new link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="gap-1.5">
        <CardTitle className="text-xl">Choose a new password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter and confirm your new password below
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  New password
                </label>
                <TogglePasswordInput
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
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
                  Confirm new password
                </label>
                <TogglePasswordInput
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
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
            Reset password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
