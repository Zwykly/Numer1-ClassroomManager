import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertReservationStudentSchema, updateReservationStudentSchema, patchReservationStudentSchema, reservationStudentsQuerySchema } from "../models/reservation_students";
import { getLimit, getCursorWhere, buildPaginationResponse } from "../utils/drizzle";

export const ReservationStudentsService = {
    async getAll(query: typeof reservationStudentsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);

        const data = await db.query.reservationStudents.findMany({
            where: cursorWhere,
            limit,
            orderBy: (rs, { asc }) => [asc(rs.id)],
        });

        return buildPaginationResponse(data, query.limit);
    },

    async getById(id: string) {
        const rs = await db.query.reservationStudents.findFirst({
            where: { id },
        });

        if (!rs) return null;
        return rs;
    },

    async create(payload: typeof insertReservationStudentSchema.static) {
        const [inserted] = await db
            .insert(table.reservationStudents)
            .values(payload)
            .returning();
        return inserted;
    },

    async update(id: string, payload: typeof updateReservationStudentSchema.static) {
        const [updated] = await db
            .update(table.reservationStudents)
            .set(payload)
            .where(eq(table.reservationStudents.id, id))
            .returning();
        return updated || null;
    },

    async patch(id: string, payload: typeof patchReservationStudentSchema.static) {
        const [patched] = await db
            .update(table.reservationStudents)
            .set(payload)
            .where(eq(table.reservationStudents.id, id))
            .returning();
        return patched || null;
    },

    async remove(id: string) {
        const [removed] = await db
            .delete(table.reservationStudents)
            .where(eq(table.reservationStudents.id, id))
            .returning();
        return removed;
    }
};
