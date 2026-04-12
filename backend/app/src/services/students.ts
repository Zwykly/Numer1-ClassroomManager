import { eq, and, or, ilike } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertStudentSchema, updateStudentSchema, patchStudentSchema, studentsQuerySchema } from "../models/students";
import { getLimit, getCursorWhere, getFuzzySearchWhere, buildPaginationResponse } from "../utils/drizzle";

export const StudentsService = {
    async getAll(query: typeof studentsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        
        const searchWhere = getFuzzySearchWhere(["firstName", "lastName"], query.search);

        const conditions = [cursorWhere, searchWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const studentsData = await db.query.students.findMany({
            where: whereClause,
            limit,
            orderBy: (students, { asc }) => [asc(students.id)],
            with: {
                groups: true,
                reservations: true,
            }
        });

        const mappedStudents = studentsData.map(student => ({
            ...student,
            groups: student.groups,
            reservations: student.reservations
        }));

        return buildPaginationResponse(mappedStudents, query.limit);
    },

    async getById(id: string) {
        const student = await db.query.students.findFirst({
            where: { id },
            with: {
                groups: true,
                reservations: true,
            }
        });

        if (!student) return null;

        return {
            ...student,
            groups: student.groups,
            reservations: student.reservations
        };
    },

    async create(payload: typeof insertStudentSchema.static) {
        const [newStudent] = await db
            .insert(table.students)
            .values(payload)
            .returning();
        return this.getById(newStudent.id);
    },

    async update(id: string, payload: typeof updateStudentSchema.static) {
        const [updatedStudent] = await db
            .update(table.students)
            .set(payload)
            .where(eq(table.students.id, id))
            .returning();
        if (!updatedStudent) return null;
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchStudentSchema.static) {
        const [patchedStudent] = await db
            .update(table.students)
            .set(payload)
            .where(eq(table.students.id, id))
            .returning();
        if (!patchedStudent) return null;
        return this.getById(id);
    },

    async remove(id: string) {
        const [removedStudent] = await db
            .delete(table.students)
            .where(eq(table.students.id, id))
            .returning();
        return removedStudent;
    }
};
