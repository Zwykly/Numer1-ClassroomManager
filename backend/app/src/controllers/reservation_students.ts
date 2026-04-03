import { db } from "../db/db";
import { insertReservationStudentSchema, updateReservationStudentSchema, removeReservationStudentSchema } from "../models/reservation_students";
import { table } from "../db/schema";
import { eq } from "drizzle-orm";

const createReservationStudent = async (payload: typeof insertReservationStudentSchema.static) => {
    const [newReservationStudent] = await db
        .insert(table.reservationStudents)
        .values(payload)
        .returning();
    return newReservationStudent;
};

const getAllReservationStudents = async () => {
    const reservationStudents = await db
        .select()
        .from(table.reservationStudents);
    return reservationStudents;
};

const updateReservationStudent = async (payload: typeof updateReservationStudentSchema.static) => {
    if (!payload.id) throw new Error("ID is required");

    const [updatedReservationStudent] = await db
        .update(table.reservationStudents)
        .set(payload)
        .where(eq(table.reservationStudents.id, payload.id))
        .returning();
    return updatedReservationStudent;
};

const removeReservationStudent = async (payload: typeof removeReservationStudentSchema.static) => {
    const [removedReservationStudent] = await db
        .delete(table.reservationStudents)
        .where(eq(table.reservationStudents.id, payload.id))
        .returning();
    return removedReservationStudent;
};

export const reservationStudentsController = {
    createReservationStudent,
    getAllReservationStudents,
    updateReservationStudent,
    removeReservationStudent,
} as const;

export type reservationStudentsController = typeof reservationStudentsController;
