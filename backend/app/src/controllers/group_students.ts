import { db } from "..";
import { insertGroupStudentSchema, updateGroupStudentSchema, removeGroupStudentSchema } from "../models/group_students";
import { table } from "../db/schema";
import { eq } from "drizzle-orm";

const createGroupStudent = async (payload: typeof insertGroupStudentSchema.static) => {
    const [newGroupStudent] = await db
        .insert(table.groupStudents)
        .values(payload)
        .returning();
    return newGroupStudent;
};

const getAllGroupStudents = async () => {
    const groupStudents = await db
        .select()
        .from(table.groupStudents);
    return groupStudents;
};

const updateGroupStudent = async (payload: typeof updateGroupStudentSchema.static) => {
    if (!payload.id) throw new Error("ID is required");

    const [updatedGroupStudent] = await db
        .update(table.groupStudents)
        .set(payload)
        .where(eq(table.groupStudents.id, payload.id))
        .returning();
    return updatedGroupStudent;
};

const removeGroupStudent = async (payload: typeof removeGroupStudentSchema.static) => {
    const [removedGroupStudent] = await db
        .delete(table.groupStudents)
        .where(eq(table.groupStudents.id, payload.id))
        .returning();
    return removedGroupStudent;
};

export const groupStudentsController = {
    createGroupStudent,
    getAllGroupStudents,
    updateGroupStudent,
    removeGroupStudent,
} as const;

export type groupStudentsController = typeof groupStudentsController;
