import { db } from "../db/db";
import { insertClassroomReservationSchema, updateClassroomReservationSchema, removeClassroomReservationSchema } from "../models/classroom_reservations";
import { table } from "../db/schema";
import { eq } from "drizzle-orm";

const createClassroomReservation = async (payload: typeof insertClassroomReservationSchema.static) => {
    const [newClassroomReservation] = await db
        .insert(table.classroomReservations)
        .values({
            ...payload,
            startDate: new Date(payload.startDate),
            endDate: new Date(payload.endDate),
        })
        .returning();
    return newClassroomReservation;
};

const getAllClassroomReservations = async () => {
    const classroomReservations = await db
        .select()
        .from(table.classroomReservations);
    return classroomReservations;
};

const updateClassroomReservation = async (payload: typeof updateClassroomReservationSchema.static) => {
    if (!payload.id) throw new Error("ID is required");

    const [updatedClassroomReservation] = await db
        .update(table.classroomReservations)
        .set({
            ...payload,
            startDate: new Date(payload.startDate),
            endDate: new Date(payload.endDate),
            editedOn: new Date(),
        })
        .where(eq(table.classroomReservations.id, payload.id))
        .returning();
    return updatedClassroomReservation;
};

const removeClassroomReservation = async (payload: typeof removeClassroomReservationSchema.static) => {
    const [removedClassroomReservation] = await db
        .delete(table.classroomReservations)
        .where(eq(table.classroomReservations.id, payload.id))
        .returning();
    return removedClassroomReservation;
};


export const classroomReservationsController = {
    createClassroomReservation,
    getAllClassroomReservations,
    updateClassroomReservation,
    removeClassroomReservation,
} as const;

export type classroomReservationsController = typeof classroomReservationsController;