import { db } from "..";
import { insertTeacherGroupSchema, updateTeacherGroupSchema, removeTeacherGroupSchema } from "../models/teacher_groups";
import { table } from "../db/schema";
import { eq } from "drizzle-orm";

const createTeacherGroup = async (payload: typeof insertTeacherGroupSchema.static) => {
    const [newTeacherGroup] = await db
        .insert(table.teacherGroups)
        .values(payload)
        .returning();
    return newTeacherGroup;
};

const getAllTeacherGroups = async () => {
    const teacherGroups = await db
        .select()
        .from(table.teacherGroups);
    return teacherGroups;
};

const updateTeacherGroup = async (payload: typeof updateTeacherGroupSchema.static) => {
    if (!payload.id) throw new Error("ID is required");

    const [updatedTeacherGroup] = await db
        .update(table.teacherGroups)
        .set(payload)
        .where(eq(table.teacherGroups.id, payload.id))
        .returning();
    return updatedTeacherGroup;
};

const removeTeacherGroup = async (payload: typeof removeTeacherGroupSchema.static) => {
    const [removedTeacherGroup] = await db
        .delete(table.teacherGroups)
        .where(eq(table.teacherGroups.id, payload.id))
        .returning();
    return removedTeacherGroup;
};

export const teacherGroupsController = {
    createTeacherGroup,
    getAllTeacherGroups,
    updateTeacherGroup,
    removeTeacherGroup,
} as const;

export type teacherGroupsController = typeof teacherGroupsController;
