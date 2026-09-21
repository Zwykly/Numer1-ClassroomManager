import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertTeacherGroupSchema, updateTeacherGroupSchema, patchTeacherGroupSchema, teacherGroupsQuerySchema } from "../models/teacher_groups";
import { getLimit, getCursorWhere, buildPaginationResponse } from "../utils/drizzle";

export const TeacherGroupsService = {
    async getAll(query: typeof teacherGroupsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);

        const data = await db.query.teacherGroups.findMany({
            where: cursorWhere,
            limit,
            orderBy: (tg, { asc }) => [asc(tg.id)],
        });

        return buildPaginationResponse(data, query.limit);
    },

    async getById(id: string) {
        const tg = await db.query.teacherGroups.findFirst({
            where: { id },
        });

        if (!tg) return null;
        return tg;
    },

    async create(payload: typeof insertTeacherGroupSchema.static) {
        const [inserted] = await db
            .insert(table.teacherGroups)
            .values(payload)
            .returning();
        return inserted;
    },

    async update(id: string, payload: typeof updateTeacherGroupSchema.static) {
        const [updated] = await db
            .update(table.teacherGroups)
            .set(payload)
            .where(eq(table.teacherGroups.id, id))
            .returning();
        return updated || null;
    },

    async patch(id: string, payload: typeof patchTeacherGroupSchema.static) {
        const [patched] = await db
            .update(table.teacherGroups)
            .set(payload)
            .where(eq(table.teacherGroups.id, id))
            .returning();
        return patched || null;
    },

    async remove(id: string) {
        const [removed] = await db
            .delete(table.teacherGroups)
            .where(eq(table.teacherGroups.id, id))
            .returning();
        return removed;
    }
};
