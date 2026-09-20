import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertTeacherStudentSchema, updateTeacherStudentSchema, patchTeacherStudentSchema, teacherStudentsQuerySchema } from "../models/teacher_students";
import { getLimit, getCursorWhere, buildPaginationResponse } from "../utils/drizzle";

export const TeacherStudentsService = {
    async getAll(query: typeof teacherStudentsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);

        const data = await db.query.teacherStudents.findMany({
            where: cursorWhere,
            limit,
            orderBy: (ts, { asc }) => [asc(ts.id)],
        });

        return buildPaginationResponse(data, query.limit);
    },

    async getById(id: string) {
        const ts = await db.query.teacherStudents.findFirst({
            where: { id },
        });

        if (!ts) return null;
        return ts;
    },

    async create(payload: typeof insertTeacherStudentSchema.static) {
        const [inserted] = await db
            .insert(table.teacherStudents)
            .values(payload)
            .returning();
        return inserted;
    },

    async update(id: string, payload: typeof updateTeacherStudentSchema.static) {
        const [updated] = await db
            .update(table.teacherStudents)
            .set(payload)
            .where(eq(table.teacherStudents.id, id))
            .returning();
        return updated || null;
    },

    async patch(id: string, payload: typeof patchTeacherStudentSchema.static) {
        const [patched] = await db
            .update(table.teacherStudents)
            .set(payload)
            .where(eq(table.teacherStudents.id, id))
            .returning();
        return patched || null;
    },

    async remove(id: string) {
        const [removed] = await db
            .delete(table.teacherStudents)
            .where(eq(table.teacherStudents.id, id))
            .returning();
        return removed;
    }
};
