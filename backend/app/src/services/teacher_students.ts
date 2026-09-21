import { eq, inArray } from "drizzle-orm";
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

    // Ids of every student currently associated with a teacher.
    async getStudentIds(teacherId: string) {
        const rows = await db
            .select({ studentId: table.teacherStudents.studentId })
            .from(table.teacherStudents)
            .where(eq(table.teacherStudents.teacherId, teacherId));
        return rows.map((row) => row.studentId);
    },

    // Ids of every student that belongs to any of the given groups.
    async getStudentIdsForGroups(groupIds: string[]) {
        if (groupIds.length === 0) return [];
        const rows = await db
            .select({ studentId: table.groupStudents.studentId })
            .from(table.groupStudents)
            .where(inArray(table.groupStudents.groupId, groupIds));
        return [...new Set(rows.map((row) => row.studentId))];
    },

    async getGroupIdsForTeacher(teacherId: string) {
        const rows = await db
            .select({ groupId: table.teacherGroups.groupId })
            .from(table.teacherGroups)
            .where(eq(table.teacherGroups.teacherId, teacherId));
        return rows.map((row) => row.groupId);
    },

    async getTeacherIdsForGroup(groupId: string) {
        const rows = await db
            .select({ teacherId: table.teacherGroups.teacherId })
            .from(table.teacherGroups)
            .where(eq(table.teacherGroups.groupId, groupId));
        return rows.map((row) => row.teacherId);
    },

    // Associates students with a teacher, skipping pairs that already exist.
    async addStudents(teacherId: string, studentIds: string[]) {
        if (studentIds.length === 0) return;

        const existing = await db
            .select({ studentId: table.teacherStudents.studentId })
            .from(table.teacherStudents)
            .where(eq(table.teacherStudents.teacherId, teacherId));
        const existingIds = new Set(existing.map((row) => row.studentId));

        const toInsert = [...new Set(studentIds)].filter((studentId) => !existingIds.has(studentId));
        if (toInsert.length === 0) return;

        await db
            .insert(table.teacherStudents)
            .values(toInsert.map((studentId) => ({ teacherId, studentId })));
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
