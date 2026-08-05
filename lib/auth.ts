import { db } from "@/src/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import * as schema from "@/src/db/auth-schema";



export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),

    emailAndPassword: {
        enabled: true,
    },

    plugins: [username()],
});