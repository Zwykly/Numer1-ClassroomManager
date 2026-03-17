import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";
import { t } from "elysia";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db";
import * as auth_schema from "../../auth-schema";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { insertUserSchema } from "../models/users";
import { usersController } from "../controllers/users";
import { openAPI } from "better-auth/plugins"

type InsertUserPayload = typeof insertUserSchema._type;

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: auth_schema,
    }),
    trustedOrigins: ["http://localhost:3030", "http://zwykly.duckdns.org", "http://zwykly.duckdns.org:3030"],
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
                        const newUser = await usersController.createUser(payload);
                        console.log("Created business user:", newUser.firstName, " ", newUser.lastName);
                    } catch (error) {
                        console.log("Failed to create user info instance", error)
                        throw error;
                    }
                }
            }
        }
    }
});
