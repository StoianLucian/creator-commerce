import { db } from "@/src/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import * as schema from "@/src/db/auth-schema";
import { sendVerificationEmail } from "@/lib/email";



export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
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

    plugins: [username()],
});