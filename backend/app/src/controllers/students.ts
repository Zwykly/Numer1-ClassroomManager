import { db } from "..";
import { insertStudentSchema, updateStudentSchema, removeStudentSchema } from "../models/students";
import { table } from "../db/schema";
import { eq } from "drizzle-orm";

const createStudent = async (payload: typeof insertStudentSchema.static) => {
    const [newStudent] = await db
        .insert(table.students)
        .values(payload)
        .returning();
    return newStudent;
};

const getAllStudents = async () => {
    const students = await db
        .select()
        .from(table.students);
    return students;
};

const updateStudent = async (payload: typeof updateStudentSchema.static) => {
    if (!payload.id) throw new Error("ID is required");

    const [updatedStudent] = await db
        .update(table.students)
        .set(payload)
        .where(eq(table.students.id, payload.id))
        .returning();
    return updatedStudent;
};

const removeStudent = async (payload: typeof removeStudentSchema.static) => {
    const [removedStudent] = await db
        .delete(table.students)
        .where(eq(table.students.id, payload.id))
        .returning();
    return removedStudent;
};

export const studentsController = {
    createStudent,
    getAllStudents,
    updateStudent,
    removeStudent,
} as const;

export type studentsController = typeof studentsController;
