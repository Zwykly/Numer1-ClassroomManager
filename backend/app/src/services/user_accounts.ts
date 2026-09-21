import { db } from "../db/db";
import { auth } from "../auth/auth";
import { UsersService } from "./users";
import type { createUserAccountSchema } from "../models/users";

// Generates a readable, reasonably strong sample password for newly created accounts.
export function generateSamplePassword(): string {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    const body = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
    return `Sample-${body}`;
}

export type CreateAccountResult =
    | { ok: true; user: NonNullable<Awaited<ReturnType<typeof UsersService.getById>>>; password: string }
    | { ok: false; reason: "EMAIL_IN_USE" | "CREATION_FAILED" };

export type ResetPasswordResult =
    | { ok: true; password: string }
    | { ok: false; reason: "USER_NOT_FOUND" | "NO_AUTH_ACCOUNT" | "RESET_FAILED" };

export type SetPasswordResult =
    | { ok: true }
    | { ok: false; reason: "USER_NOT_FOUND" | "NO_AUTH_ACCOUNT" | "RESET_FAILED" };

// Stores a credential password for a business user's better-auth account.
// Optionally revokes the user's sessions so existing logins are invalidated.
async function writePassword(
    userId: string,
    password: string,
    revokeSessions: boolean,
): Promise<SetPasswordResult> {
    const user = await UsersService.getById(userId);
    if (!user) return { ok: false, reason: "USER_NOT_FOUND" };
    if (!user.authId) return { ok: false, reason: "NO_AUTH_ACCOUNT" };

    try {
        const context = await auth.$context;
        const hashedPassword = await context.password.hash(password);

        const accounts = await context.internalAdapter.findAccounts(user.authId);
        const credential = accounts.find((account) => account.providerId === "credential");
        if (credential) {
            await context.internalAdapter.updatePassword(user.authId, hashedPassword);
        } else {
            await context.internalAdapter.createAccount({
                userId: user.authId,
                providerId: "credential",
                accountId: user.authId,
                password: hashedPassword,
            });
        }

        if (revokeSessions) {
            await context.internalAdapter.deleteSessions(user.authId);
        }

        return { ok: true };
    } catch (error) {
        console.error("Failed to store password", error);
        return { ok: false, reason: "RESET_FAILED" };
    }
}

export const UserAccountsService = {
    async createAccount(payload: typeof createUserAccountSchema.static): Promise<CreateAccountResult> {
        const existing = await db.query.users.findFirst({
            where: { email: payload.email },
        });

        if (existing) {
            return { ok: false, reason: "EMAIL_IN_USE" };
        }

        const password = payload.password && payload.password.length > 0
            ? payload.password
            : generateSamplePassword();

        // Creates the better-auth user account. The database hook in auth.ts
        // automatically mirrors it into the business `users` table.
        const result = await auth.api.signUpEmail({
            body: {
                name: `${payload.firstName} ${payload.lastName}`.trim(),
                email: payload.email,
                password,
                firstName: payload.firstName,
                lastName: payload.lastName,
            } as any,
        });

        const created = await UsersService.getByAuthId(result.user.id);
        if (!created) {
            return { ok: false, reason: "CREATION_FAILED" };
        }

        const updated = await UsersService.patch(created.id, {
            role: payload.role,
            additionalInfo: payload.additionalInfo ?? null,
            color: payload.color ?? null,
            groupIds: payload.groupIds,
            studentIds: payload.studentIds,
        });

        if (!updated) {
            return { ok: false, reason: "CREATION_FAILED" };
        }

        return { ok: true, user: updated, password };
    },

    // Generates a fresh password for a user and stores its hash in better-auth.
    // Optionally revokes the user's sessions so existing logins are invalidated.
    async resetPassword(userId: string, revokeSessions = false): Promise<ResetPasswordResult> {
        const password = generateSamplePassword();
        const result = await writePassword(userId, password, revokeSessions);
        if (!result.ok) return { ok: false, reason: result.reason };
        return { ok: true, password };
    },

    // Stores a password chosen by the user themselves.
    async setPassword(userId: string, newPassword: string, revokeSessions = false): Promise<SetPasswordResult> {
        return writePassword(userId, newPassword, revokeSessions);
    },
};
