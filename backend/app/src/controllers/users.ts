import { db } from "../db/db";
import { insertUserSchema, updateUserSchema, removeUserSchema, loginRequestUsersSchema } from "../models/users";
import { table, users } from "../db/schema";
import * as authSchema from "../db/auth-schema";
import { eq } from "drizzle-orm";
import { auth } from "../auth/auth";

const createUser = async (payload: typeof insertUserSchema.static) => {
    const [newUser] = await db
        .insert(table.users)
        .values(payload)
        .returning();
    return newUser;
};

const getAllUsers = async () => {
    const users = await db
        .select()
        .from(table.users);
    return users;
};

const updateUser = async (payload: typeof updateUserSchema.static) => {
    if (!payload.id) throw new Error("ID is required");

    const [updatedUser] = await db
        .update(table.users)
        .set(payload)
        .where(eq(table.users.id, payload.id))
        .returning();
    return updatedUser;
};

const removeUser = async (payload: typeof removeUserSchema.static) => {
    const [removedUser] = await db
        .delete(table.users)
        .where(eq(table.users.id, payload.id))
        .returning();
    return removedUser;
};

export const usersController = {
    createUser,
    getAllUsers,
    updateUser,
    removeUser,
} as const;

export type usersController = typeof usersController;
