import { db } from "..";
import { insertUserSchema, updateUserSchema, removeUserSchema, loginRequestUsersSchema } from "../models/users";
import { table } from "../db/schema";
import { eq } from "drizzle-orm";

const loginUser = async (payload: typeof loginRequestUsersSchema.static) => {
    const [user] = await db
        .select()
        .from(table.users)
        .where(eq(table.users.username, payload.username) 
            && eq(table.users.password, payload.password));
    if (!user)
    {
        return {
            success: false,
            message: "User wasn't found in DB",
        }
    }
    return {
        user: user,
        success: true,
        message: "User found, you can log in remember to add JWT token",
    };
};

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
    loginUser,
} as const;

export type usersController = typeof usersController;
