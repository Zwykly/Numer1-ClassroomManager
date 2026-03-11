import { db } from "..";
import { insertReservationGroupSchema, updateReservationGroupSchema, removeReservationGroupSchema } from "../models/reservation_groups";
import { table } from "../db/schema";
import { eq } from "drizzle-orm";

const createReservationGroup = async (payload: typeof insertReservationGroupSchema.static) => {
    const [newReservationGroup] = await db
        .insert(table.reservationGroups)
        .values(payload)
        .returning();
    return newReservationGroup;
};

const getAllReservationGroups = async () => {
    const reservationGroups = await db
        .select()
        .from(table.reservationGroups);
    return reservationGroups;
};

const updateReservationGroup = async (payload: typeof updateReservationGroupSchema.static) => {
    if (!payload.id) throw new Error("ID is required");

    const [updatedReservationGroup] = await db
        .update(table.reservationGroups)
        .set(payload)
        .where(eq(table.reservationGroups.id, payload.id))
        .returning();
    return updatedReservationGroup;
};

const removeReservationGroup = async (payload: typeof removeReservationGroupSchema.static) => {
    const [removedReservationGroup] = await db
        .delete(table.reservationGroups)
        .where(eq(table.reservationGroups.id, payload.id))
        .returning();
    return removedReservationGroup;
};

export const reservationGroupsController = {
    createReservationGroup,
    getAllReservationGroups,
    updateReservationGroup,
    removeReservationGroup,
} as const;

export type reservationGroupsController = typeof reservationGroupsController;
