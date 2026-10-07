import { db } from "@/src/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import * as schema from "@/src/db/auth-schema";
import { sendChangeEmailConfirmation, sendResetPasswordEmail, sendVerificationEmail } from "@/lib/email";



export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        // Mirrors the email-verification flow: Better Auth generates a token,
        // we email the reset link; the user lands on /reset-password.
        sendResetPassword: async ({ user, url }) => {
            await sendResetPasswordEmail({ to: user.email, url });
        },
    },

    emailVerification: {
        // Fire the verification email automatically on registration.
        sendOnSignUp: true,
        // Once they click the link, sign them in so they land logged-in.
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail({ to: user.email, url });
        },
    },

    user: {
        changeEmail: {
            enabled: true,
            // The address is already verified, so Better Auth emails a
            // confirmation link to the *current* inbox; the change only takes
            // effect once that link is clicked. Uniqueness of the new address
            // is enforced by Better Auth (privacy-preserving — it never reveals
            // whether an email is already registered).
            sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
                await sendChangeEmailConfirmation({ to: user.email, newEmail, url });
            },
        },
    },

    plugins: [username()],
});