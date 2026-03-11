import { db } from "../db/db";
import { insertGroupSchema, updateGroupSchema, removeGroupSchema } from "../models/groups";
import { table } from "../db/schema";
import { eq } from "drizzle-orm";

const createGroup = async (payload: typeof insertGroupSchema.static) => {
    const [newGroup] = await db
        .insert(table.groups)
        .values(payload)
        .returning();
    return newGroup;
};

const getAllGroups = async () => {
    const groups = await db
        .select()
        .from(table.groups);
    return groups;
};

const updateGroup = async (payload: typeof updateGroupSchema.static) => {
    if (!payload.id) throw new Error("ID is required");

    const [updatedGroup] = await db
        .update(table.groups)
        .set(payload)
        .where(eq(table.groups.id, payload.id))
        .returning();
    return updatedGroup;
};

const removeGroup = async (payload: typeof removeGroupSchema.static) => {
    const [removedGroup] = await db
        .delete(table.groups)
        .where(eq(table.groups.id, payload.id))
        .returning();
    return removedGroup;
};

export const groupsController = {
    createGroup,
    getAllGroups,
    updateGroup,
    removeGroup,
} as const;

export type groupsController = typeof groupsController;
