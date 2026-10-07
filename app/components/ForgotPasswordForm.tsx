"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import Link from "next/link";
import { AppPaths } from "@/enums/AppPaths";
import { forgotPasswordSchema } from "@/form-validations/auth";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once the request succeeds. We never reveal whether the address exists,
  // so success just means "we processed it" — show the same confirmation.
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true);
    setError(null);

    const result = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: AppPaths.RESET_PASSWORD,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Could not send the reset link");
      return;
    }

    setSentTo(data.email);
  }

  if (sentTo) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-xl">Check your inbox</CardTitle>
          <p className="text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{sentTo}</span>, we
            sent a password reset link. The link expires in 1 hour.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<Link href={AppPaths.LOGIN} />}
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="gap-1.5">
        <CardTitle className="text-xl">Forgot your password?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset it
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            Send reset link
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={AppPaths.LOGIN}
              className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              Back to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
