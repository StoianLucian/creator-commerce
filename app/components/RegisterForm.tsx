"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { TogglePasswordInput } from "@/app/components/InputComponent";
import { usePathname } from "next/dist/client/components/navigation";
import { registerSchema } from "@/formValidations/schemas";
import { authClient } from "@/lib/auth-client";

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {


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

        try {
            const { username, password, email } = data

            const result = await authClient.signUp.email({
                name: username,
                email: email,
                password,
            });

            console.log(result)
        } catch (error) {
            console.log(error)
        }


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
                        name="email"
                        render={({ field, fieldState: { error } }) => (
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
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
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field, fieldState: { error } }) => (
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </label>
                                <TogglePasswordInput
                                    type="password"
                                    id="password"
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

                    <Button type="submit" className="w-full">
                        Register
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}