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
        });

        if (!updated) {
            return { ok: false, reason: "CREATION_FAILED" };
        }

        return { ok: true, user: updated, password };
    },
};
