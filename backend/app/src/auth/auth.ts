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
import { getAllowedHosts, getAllowedOrigins } from "../utils/origins";

type InsertUserPayload = typeof insertUserSchema.static;

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: auth_schema,
    }),
    baseURL: {
        allowedHosts: getAllowedHosts(),
        fallback: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    },
    trustedOrigins: getAllowedOrigins(),
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

                        // Newly signed-up accounts start with no access; an
                        // administrator must promote them to teacher or admin.
                        role: "pending",
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
