"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TogglePasswordInput } from "@/app/components/InputComponent";
import {
  changeEmailSchema,
  changePasswordSchema,
  profileSchema,
} from "@/form-validations/auth";
import { authClient } from "@/lib/auth-client";
import { AppPaths } from "@/enums/AppPaths";

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface SettingsFormProps {
  user: {
    name: string;
    username: string;
    email: string;
  };
}

/** A labelled field wrapper matching the auth forms' markup. */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function SettingsForm({ user }: SettingsFormProps) {
  return (
    <div className="space-y-6">
      <ProfileSection user={user} />
      <EmailSection email={user.email} />
      <PasswordSection />
    </div>
  );
}

function ProfileSection({ user }: SettingsFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, username: user.username },
  });

  async function onSubmit(data: ProfileFormData) {
    setLoading(true);
    setError(null);

    // better-auth's username plugin validates uniqueness on /update-user and
    // rejects a handle owned by someone else with USERNAME_IS_ALREADY_TAKEN.
    const result = await authClient.updateUser({
      name: data.name,
      username: data.username,
      displayUsername: data.username,
    });

    setLoading(false);

    if (result.error) {
      if (result.error.code === "USERNAME_IS_ALREADY_TAKEN") {
        setError(t("settingsForm.usernameTaken"));
        return;
      }
      setError(result.error.message ?? t("settingsForm.profileFailed"));
      return;
    }

    toast.success(t("settingsForm.profileUpdated"));
    router.refresh();
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>{t("settingsForm.profile")}</CardTitle>
        <CardDescription>
          {t("settingsForm.profileDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <Field id="name" label={t("settingsForm.displayName")} error={error?.message}>
                <Input id="name" placeholder={t("settingsForm.displayNamePlaceholder")} {...field} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState: { error } }) => (
              <Field id="username" label={t("settingsForm.username")} error={error?.message}>
                <Input id="username" placeholder={t("settingsForm.usernamePlaceholder")} {...field} />
              </Field>
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

          <Button type="submit" disabled={loading}>
            {t("settingsForm.saveChanges")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function EmailSection({ email }: { email: string }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ChangeEmailFormData) {
    if (data.email.toLowerCase() === email.toLowerCase()) {
      setError(t("settingsForm.emailSame"));
      return;
    }

    setLoading(true);
    setError(null);

    // Returns success regardless of whether the address is taken (to avoid
    // leaking which emails exist). A confirmation link only actually goes out
    // when the new address is free; either way we show the same message.
    const result = await authClient.changeEmail({
      newEmail: data.email,
      callbackURL: AppPaths.SETTINGS,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? t("settingsForm.emailChangeFailed"));
      return;
    }

    setSent(true);
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>{t("settingsForm.email")}</CardTitle>
        <CardDescription>
          {t("settingsForm.currentEmail")}{" "}
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground">
            {t("settingsForm.emailSent", { email })}
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState: { error } }) => (
                <Field id="new-email" label={t("settingsForm.newEmail")} error={error?.message}>
                  <Input
                    id="new-email"
                    placeholder={t("settingsForm.newEmailPlaceholder")}
                    {...field}
                  />
                </Field>
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

            <Button type="submit" disabled={loading}>
              {t("settingsForm.sendConfirmation")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordFormData) {
    setLoading(true);
    setError(null);

    const result = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      // Changing the password signs out other devices.
      revokeOtherSessions: true,
    });

    setLoading(false);

    if (result.error) {
      if (result.error.code === "INVALID_PASSWORD") {
        setError(t("settingsForm.passwordIncorrect"));
        return;
      }
      setError(result.error.message ?? t("settingsForm.passwordChangeFailed"));
      return;
    }

    toast.success(t("settingsForm.passwordChanged"));
    reset();
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>{t("settingsForm.password")}</CardTitle>
        <CardDescription>
          {t("settingsForm.passwordDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            control={control}
            name="currentPassword"
            render={({ field, fieldState: { error } }) => (
              <Field
                id="currentPassword"
                label={t("settingsForm.currentPassword")}
                error={error?.message}
              >
                <TogglePasswordInput
                  id="currentPassword"
                  type="password"
                  placeholder={t("settingsForm.currentPasswordPlaceholder")}
                  {...field}
                />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="newPassword"
            render={({ field, fieldState: { error } }) => (
              <Field id="newPassword" label={t("settingsForm.newPassword")} error={error?.message}>
                <TogglePasswordInput
                  id="newPassword"
                  type="password"
                  placeholder={t("settingsForm.newPasswordPlaceholder")}
                  {...field}
                />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState: { error } }) => (
              <Field
                id="confirmNewPassword"
                label={t("settingsForm.confirmPassword")}
                error={error?.message}
              >
                <TogglePasswordInput
                  id="confirmNewPassword"
                  type="password"
                  placeholder={t("settingsForm.confirmPasswordPlaceholder")}
                  {...field}
                />
              </Field>
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

          <Button type="submit" disabled={loading}>
            {t("settingsForm.changePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
