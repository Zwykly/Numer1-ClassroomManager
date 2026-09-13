import { betterAuth } from "better-auth";
import { createAuthMiddleware, getSession } from "better-auth/api";
import { username } from "better-auth/plugins/username";
import { t } from "elysia";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db";
import * as auth_schema from "../../auth-schema";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { insertUserSchema, selectSimpleUserSchema } from "../models/users";
import { UsersService } from "../services/users";
import { openAPI } from "better-auth/plugins";

type InsertUserPayload = typeof insertUserSchema.static;

// Origins are configuration-driven so the same image can be deployed on any
// domain: TRUSTED_ORIGINS holds the frontend origins and BETTER_AUTH_URL the
// public backend URL. Defaults below keep local/LAN development working.
const envTrustedOrigins = (process.env.TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

function hostFromUrl(value: string | undefined): string | null {
    if (!value) return null;
    try {
        return new URL(value).host;
    } catch {
        return null;
    }
}

const envAllowedHosts = [process.env.BETTER_AUTH_URL, ...envTrustedOrigins]
    .map(hostFromUrl)
    .filter((host): host is string => host !== null)
    .flatMap((host) => {
        const hostname = host.split(":")[0];
        return [host, `${hostname}:*`];
    });

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: auth_schema,
    }),
    baseURL: {
        allowedHosts: [
            "localhost",
            "localhost:*",
            "127.0.0.1",
            "127.0.0.1:*",
            "192.168.*",
            "10.*",
            "172.*",
            "zwykly.duckdns.org",
            "zwykly.duckdns.org:*",
            ...envAllowedHosts,
        ],
        fallback: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    },
    trustedOrigins: [
        "http://localhost:3030",
        "http://zwykly.duckdns.org",
        "http://zwykly.duckdns.org:3030",
        "http://localhost:*",
        "http://127.0.0.1:*",
        "http://192.168.*",
        "http://10.*",
        "http://172.*",
        ...envTrustedOrigins,
    ],
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        username(),
        openAPI(),
    ],
    user:
    {
        additionalFields: {
            firstName: {
                type: "string",
                required: true,
                input: true,
            },
            lastName: {
                type: "string",
                required: true,
                input: true,
            }
        }
    },
    databaseHooks: {
        user: {
            create: {
                async after(user, context) {
                    const payload: InsertUserPayload = {
                        authId: user.id,
                        email: user.email,

                        // We cast to 'any' here because user.customFields are not in the default TS definition
                        firstName: user.firstName,
                        lastName: user.lastName,

                        // Handle fields that might be optional or have defaults
                        role: "teacher",
                        additionalInfo: null,
                    };
                    try {
                        const newUser = await UsersService.create(payload);
                        if (newUser) {
                            console.log("Created business user:", newUser.firstName, " ", newUser.lastName);
                        }
                    } catch (error) {
                        console.log("Failed to create user info instance", error)
                        throw error;
                    }
                }
            }
        },
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            if (!["/sign-in/email", "/sign-in/username", "/get-session"].includes(ctx.path)) return;

            const returned = ctx.context.returned as { user?: { id: string; userInfo?: unknown } } | null | undefined;
            if (!returned?.user) return;

            try {
                const userInfo = await UsersService.getByAuthId(returned.user.id);
                if (userInfo) {
                    returned.user.userInfo = userInfo;
                }
            } catch (error) {
                console.log("Failed to inject user info into login response", error);
            }
            return returned;
        })
    }
});
