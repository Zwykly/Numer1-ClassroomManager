import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertReservationGroupSchema, updateReservationGroupSchema, patchReservationGroupSchema, reservationGroupsQuerySchema } from "../models/reservation_groups";
import { getLimit, getCursorWhere, buildPaginationResponse } from "../utils/drizzle";

export const ReservationGroupsService = {
    async getAll(query: typeof reservationGroupsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);

        const data = await db.query.reservationGroups.findMany({
            where: cursorWhere,
            limit,
            orderBy: (rg, { asc }) => [asc(rg.id)],
        });

        return buildPaginationResponse(data, query.limit);
    },

    async getById(id: string) {
        const rg = await db.query.reservationGroups.findFirst({
            where: { id },
        });

        if (!rg) return null;
        return rg;
    },

    async create(payload: typeof insertReservationGroupSchema.static) {
        const [inserted] = await db
            .insert(table.reservationGroups)
            .values(payload)
            .returning();
        return inserted;
    },

    async update(id: string, payload: typeof updateReservationGroupSchema.static) {
        const [updated] = await db
            .update(table.reservationGroups)
            .set(payload)
            .where(eq(table.reservationGroups.id, id))
            .returning();
        return updated || null;
    },

    async patch(id: string, payload: typeof patchReservationGroupSchema.static) {
        const [patched] = await db
            .update(table.reservationGroups)
            .set(payload)
            .where(eq(table.reservationGroups.id, id))
            .returning();
        return patched || null;
    },

    async remove(id: string) {
        const [removed] = await db
            .delete(table.reservationGroups)
            .where(eq(table.reservationGroups.id, id))
            .returning();
        return removed;
    }
};
