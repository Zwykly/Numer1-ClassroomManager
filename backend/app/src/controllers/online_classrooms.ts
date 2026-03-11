import { db } from "..";
import { insertOnlineClassroomSchema, updateOnlineClassroomSchema, removeOnlineClassroomSchema } from "../models/online_classrooms";
import { table } from "../db/schema";
import { eq } from "drizzle-orm";

const createOnlineClassroom = async (payload: typeof insertOnlineClassroomSchema.static) => {
    const [newOnlineClassroom] = await db
        .insert(table.onlineClassrooms)
        .values(payload)
        .returning();
    return newOnlineClassroom;
};

const getAllOnlineClassrooms = async () => {
    const onlineClassrooms = await db
        .select()
        .from(table.onlineClassrooms);
    return onlineClassrooms;
};

const updateOnlineClassroom = async (payload: typeof updateOnlineClassroomSchema.static) => {
    if (!payload.id) throw new Error("ID is required");

    const [updatedOnlineClassroom] = await db
        .update(table.onlineClassrooms)
        .set(payload)
        .where(eq(table.onlineClassrooms.id, payload.id))
        .returning();
    return updatedOnlineClassroom;
};

const removeOnlineClassroom = async (payload: typeof removeOnlineClassroomSchema.static) => {
    const [removedOnlineClassroom] = await db
        .delete(table.onlineClassrooms)
        .where(eq(table.onlineClassrooms.id, payload.id))
        .returning();
    return removedOnlineClassroom;
};

export const onlineClassroomsController = {
    createOnlineClassroom,
    getAllOnlineClassrooms,
    updateOnlineClassroom,
    removeOnlineClassroom,
} as const;

export type onlineClassroomsController = typeof onlineClassroomsController;
