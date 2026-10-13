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
import { Trans, useTranslation } from "react-i18next";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { t } = useTranslation();
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
      setError(result.error.message ?? t("auth.forgot.sendFailed"));
      return;
    }

    setSentTo(data.email);
  }

  if (sentTo) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-xl">{t("auth.forgot.checkInbox")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            <Trans
              i18nKey="auth.forgot.sentBody"
              values={{ email: sentTo }}
              components={{ strong: <span className="font-medium text-foreground" /> }}
            />
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
            {t("auth.forgot.backToSignIn")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="gap-1.5">
        <CardTitle className="text-xl">{t("auth.forgot.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("auth.forgot.subtitle")}
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
                  {t("auth.forgot.email")}
                </label>

                <Input
                  id="email"
                  placeholder={t("auth.forgot.emailPlaceholder")}
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
            {t("auth.forgot.submit")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={AppPaths.LOGIN}
              className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              {t("auth.forgot.backToSignIn")}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
