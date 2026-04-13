import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertOnlineClassroomSchema, updateOnlineClassroomSchema, patchOnlineClassroomSchema, onlineClassroomsQuerySchema } from "../models/online_classrooms";
import { getLimit, getCursorWhere, getInArrayWhere, buildPaginationResponse } from "../utils/drizzle";

export const OnlineClassroomsService = {
    async getAll(query: typeof onlineClassroomsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const statusWhere = getInArrayWhere("status", query.status);

        const conditions = [cursorWhere, statusWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const data = await db.query.onlineClassrooms.findMany({
            where: whereClause,
            limit,
            orderBy: (oc, { asc }) => [asc(oc.id)],
            with: {
                classroomReservations: true,
                reservationCycles: true,
            }
        });

        const mapped = data.map(c => ({
            ...c,
            reservations: c.classroomReservations,
            reservationCycles: c.reservationCycles,
        }));

        return buildPaginationResponse(mapped, query.limit);
    },

    async getById(id: string) {
        const oc = await db.query.onlineClassrooms.findFirst({
            where: { id },
            with: {
                classroomReservations: true,
                reservationCycles: true,
            }
        });

        if (!oc) return null;

        return {
            ...oc,
            reservations: oc.classroomReservations,
            reservationCycles: oc.reservationCycles,
        };
    },

    async create(payload: typeof insertOnlineClassroomSchema.static) {
        const [inserted] = await db
            .insert(table.onlineClassrooms)
            .values(payload)
            .returning();
        return this.getById(inserted.id);
    },

    async update(id: string, payload: typeof updateOnlineClassroomSchema.static) {
        const [updated] = await db
            .update(table.onlineClassrooms)
            .set(payload)
            .where(eq(table.onlineClassrooms.id, id))
            .returning();
        if (!updated) return null;
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchOnlineClassroomSchema.static) {
        const [patched] = await db
            .update(table.onlineClassrooms)
            .set(payload)
            .where(eq(table.onlineClassrooms.id, id))
            .returning();
        if (!patched) return null;
        return this.getById(id);
    },

    async remove(id: string) {
        const [removed] = await db
            .delete(table.onlineClassrooms)
            .where(eq(table.onlineClassrooms.id, id))
            .returning();
        return removed;
    }
};
