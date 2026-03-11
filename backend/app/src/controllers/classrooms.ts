import { db } from "../db/db";
import { insertClassroomSchema, updateClassroomSchema, removeClassroomSchema } from "../models/classrooms";
import { table } from "../db/schema";
import { eq } from "drizzle-orm";

const createClassroom = async (payload: typeof insertClassroomSchema.static) => {
    const [newClassroom] = await db
        .insert(table.classrooms)
        .values(payload)
        .returning();
    return newClassroom;
};

const getAllClassrooms = async () => {
    const classrooms = await db
        .select()
        .from(table.classrooms);
    return classrooms;
};

const updateClassroom = async (payload: typeof updateClassroomSchema.static) => {
    if (!payload.id) throw new Error("ID is required");

    const [updatedClassroom] = await db
        .update(table.classrooms)
        .set(payload)
        .where(eq(table.classrooms.id, payload.id))
        .returning();
    return updatedClassroom;
};

const removeClassroom = async (payload: typeof removeClassroomSchema.static) => {
    const [removedClassroom] = await db
        .delete(table.classrooms)
        .where(eq(table.classrooms.id, payload.id))
        .returning();
    return removedClassroom;
};

export const classroomsController = {
    createClassroom,
    getAllClassrooms,
    updateClassroom,
    removeClassroom,
} as const;

export type classroomsController = typeof classroomsController;
