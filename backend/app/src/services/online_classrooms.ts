import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertOnlineClassroomSchema, updateOnlineClassroomSchema, patchOnlineClassroomSchema, onlineClassroomsQuerySchema } from "../models/online_classrooms";
import { getLimit, getCursorWhere, getInArrayWhere, buildPaginationResponse } from "../utils/drizzle";

export const OnlineClassroomsService = {
    async getAll(query: typeof onlineClassroomsQuerySchema.static, viewer?: { id?: string; isAdmin: boolean }) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const statusWhere = getInArrayWhere("status", query.status);
        const viewerWhere = viewer && !viewer.isAdmin && viewer.id ? { teacherId: viewer.id } : undefined;

        const conditions = [cursorWhere, statusWhere, viewerWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const data = await db.query.onlineClassrooms.findMany({
            where: whereClause,
            limit,
            orderBy: (oc, { asc }) => [asc(oc.id)],
            with: {
                users: true,
                classroomReservations: true,
                reservationCycles: true,
            }
        });

        const mapped = data.map(({ users, classroomReservations, reservationCycles, ...base }) => ({
            ...base,
            teacher: users ?? undefined,
            reservations: classroomReservations,
            reservationCycles,
        }));

        return buildPaginationResponse(mapped, query.limit);
    },

    async getById(id: string) {
        const oc = await db.query.onlineClassrooms.findFirst({
            where: { id },
            with: {
                users: true,
                classroomReservations: true,
                reservationCycles: true,
            }
        });

        if (!oc) return null;

        const { users, classroomReservations, reservationCycles, ...base } = oc;
        return {
            ...base,
            teacher: users ?? undefined,
            reservations: classroomReservations,
            reservationCycles,
        };
    },

    // Lightweight ownership lookups used by access checks.
    async getOwnerId(id: string) {
        const oc = await db.query.onlineClassrooms.findFirst({ where: { id } });
        return oc?.teacherId ?? null;
    },

    async getByTeacherId(teacherId: string) {
        const oc = await db.query.onlineClassrooms.findFirst({ where: { teacherId } });
        return oc?.id ?? null;
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
