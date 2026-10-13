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
import { useTranslation } from "react-i18next";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const { t } = useTranslation();
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
      setError(result.error.message ?? t("auth.reset.resetFailed"));
      return;
    }

    toast.success(t("auth.reset.resetSuccess"));
    router.push(AppPaths.LOGIN);
  }

  // Reached without a token (link mistyped, already consumed, or expired at the
  // callback step) — there's nothing to submit against, so steer them to retry.
  if (!token) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-xl">{t("auth.reset.invalidTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("auth.reset.invalidBody")}
          </p>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<Link href={AppPaths.FORGOT_PASSWORD} />}
          >
            {t("auth.reset.requestNew")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="gap-1.5">
        <CardTitle className="text-xl">{t("auth.reset.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("auth.reset.subtitle")}
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
                  {t("auth.reset.newPassword")}
                </label>
                <TogglePasswordInput
                  id="password"
                  type="password"
                  placeholder={t("auth.reset.newPasswordPlaceholder")}
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
                  {t("auth.reset.confirmPassword")}
                </label>
                <TogglePasswordInput
                  id="confirmPassword"
                  type="password"
                  placeholder={t("auth.reset.confirmPasswordPlaceholder")}
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
            {t("auth.reset.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
