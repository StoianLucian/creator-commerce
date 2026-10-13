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
import { useTranslation } from "react-i18next";

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {

  const router = useRouter()
  const { t } = useTranslation()
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
        setError(t("auth.login.emailNotVerified"))
        return
      }
      setError(result.error.message ?? t("auth.login.invalidCredentials"))
      return
    }

    router.push(AppPaths.DASHBOARD)
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="gap-1.5">
        <CardTitle className="text-xl">{t("auth.login.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("auth.login.subtitle")}
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
                  {t("auth.login.username")}
                </label>

                <Input
                  id="username"
                  placeholder={t("auth.login.usernamePlaceholder")}
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
                    {t("auth.login.password")}
                  </label>
                  <Link
                    href={AppPaths.FORGOT_PASSWORD}
                    className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    {t("auth.login.forgot")}
                  </Link>
                </div>
                <TogglePasswordInput
                  id="password"
                  type="password"
                  placeholder={t("auth.login.passwordPlaceholder")}
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
            {t("auth.login.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}