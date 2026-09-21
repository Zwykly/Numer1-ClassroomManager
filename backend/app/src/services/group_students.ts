import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertGroupStudentSchema, updateGroupStudentSchema, patchGroupStudentSchema, groupStudentsQuerySchema } from "../models/group_students";
import { getLimit, getCursorWhere, buildPaginationResponse } from "../utils/drizzle";

export const GroupStudentsService = {
    async getAll(query: typeof groupStudentsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);

        const data = await db.query.groupStudents.findMany({
            where: cursorWhere,
            limit,
            orderBy: (gs, { asc }) => [asc(gs.id)],
        });

        return buildPaginationResponse(data, query.limit);
    },

    async getById(id: string) {
        const gs = await db.query.groupStudents.findFirst({
            where: { id },
        });

        if (!gs) return null;
        return gs;
    },

    async create(payload: typeof insertGroupStudentSchema.static) {
        const [inserted] = await db
            .insert(table.groupStudents)
            .values(payload)
            .returning();
        return inserted;
    },

    async update(id: string, payload: typeof updateGroupStudentSchema.static) {
        const [updated] = await db
            .update(table.groupStudents)
            .set(payload)
            .where(eq(table.groupStudents.id, id))
            .returning();
        return updated || null;
    },

    async patch(id: string, payload: typeof patchGroupStudentSchema.static) {
        const [patched] = await db
            .update(table.groupStudents)
            .set(payload)
            .where(eq(table.groupStudents.id, id))
            .returning();
        return patched || null;
    },

    async remove(id: string) {
        const [removed] = await db
            .delete(table.groupStudents)
            .where(eq(table.groupStudents.id, id))
            .returning();
        return removed;
    }
};
