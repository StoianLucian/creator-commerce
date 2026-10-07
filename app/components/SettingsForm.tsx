"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
        setError("That username is already taken — pick another.");
        return;
      }
      setError(result.error.message ?? "Could not update your profile");
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your display name and public @handle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <Field id="name" label="Display name" error={error?.message}>
                <Input id="name" placeholder="Your name" {...field} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState: { error } }) => (
              <Field id="username" label="Username" error={error?.message}>
                <Input id="username" placeholder="your_handle" {...field} />
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
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function EmailSection({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ChangeEmailFormData) {
    if (data.email.toLowerCase() === email.toLowerCase()) {
      setError("That's already your email address.");
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
      setError(result.error.message ?? "Could not request the email change");
      return;
    }

    setSent(true);
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Email</CardTitle>
        <CardDescription>
          Current email: <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground">
            Check your current inbox ({email}) for a link to confirm the change.
            Your email won&apos;t change until you click it.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState: { error } }) => (
                <Field id="new-email" label="New email" error={error?.message}>
                  <Input
                    id="new-email"
                    placeholder="you@example.com"
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
              Send confirmation link
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
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
        setError("Your current password is incorrect.");
        return;
      }
      setError(result.error.message ?? "Could not change your password");
      return;
    }

    toast.success("Password changed");
    reset();
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Changing your password signs you out everywhere else.
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
                label="Current password"
                error={error?.message}
              >
                <TogglePasswordInput
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  {...field}
                />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="newPassword"
            render={({ field, fieldState: { error } }) => (
              <Field id="newPassword" label="New password" error={error?.message}>
                <TogglePasswordInput
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
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
                label="Confirm new password"
                error={error?.message}
              >
                <TogglePasswordInput
                  id="confirmNewPassword"
                  type="password"
                  placeholder="Confirm your new password"
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
            Change password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
