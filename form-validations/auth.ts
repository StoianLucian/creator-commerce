import z from "zod";

export const loginSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be less than 31 characters")
        // Usernames become @handles in URLs, so keep them URL-safe.
        // Matches better-auth's default username validator.
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    password: z.string().min(8, "Password must be at least 8 characters")
})

export const registerSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be less than 31 characters")
        // Usernames become @handles in URLs, so keep them URL-safe.
        // Matches better-auth's default username validator.
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    email: z.email(),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});