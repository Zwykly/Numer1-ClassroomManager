import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { createStudentSchema, updateStudentSchema, patchStudentSchema, studentsQuerySchema } from "../models/students";
import { getLimit, getCursorWhere, getFuzzySearchWhere, buildPaginationResponse } from "../utils/drizzle";

type Viewer = {
    id?: string;
    isAdmin: boolean;
};

export const StudentsService = {
    // Ids of the students associated with a given teacher.
    async getTeacherStudentIds(teacherId: string) {
        const rows = await db
            .select({ id: table.teacherStudents.studentId })
            .from(table.teacherStudents)
            .where(eq(table.teacherStudents.teacherId, teacherId));
        return rows.map((row) => row.id);
    },

    async getAll(query: typeof studentsQuerySchema.static, viewer?: Viewer) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);

        const searchWhere = getFuzzySearchWhere(["firstName", "lastName"], query.search);
        const viewerWhere = viewer && !viewer.isAdmin && viewer.id
            ? { teachers: { id: viewer.id } }
            : undefined;

        const conditions = [cursorWhere, searchWhere, viewerWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const studentsData = await db.query.students.findMany({
            where: whereClause,
            limit,
            orderBy: (students, { asc }) => [asc(students.id)],
            with: {
                teachers: true,
                groups: true,
                reservations: true,
            }
        });

        // A teacher may only see this student's classes that they teach.
        const scoped = viewer && !viewer.isAdmin && viewer.id
            ? studentsData.map((student) => ({
                ...student,
                reservations: student.reservations.filter((reservation) => reservation.teacherId === viewer.id),
            }))
            : studentsData;

        return buildPaginationResponse(scoped, query.limit);
    },

    async getById(id: string, viewer?: Viewer) {
        const student = await db.query.students.findFirst({
            where: { id },
            with: {
                teachers: true,
                groups: true,
                reservations: true,
            }
        });

        if (!student) return null;
        if (viewer && !viewer.isAdmin && viewer.id && !student.teachers.some((teacher) => teacher.id === viewer.id)) {
            return null;
        }

        if (viewer && !viewer.isAdmin && viewer.id) {
            return {
                ...student,
                reservations: student.reservations.filter((reservation) => reservation.teacherId === viewer.id),
            };
        }

        return student;
    },

    async setTeachers(studentId: string, teacherIds?: string[]) {
        if (!teacherIds) return;

        await db.delete(table.teacherStudents).where(eq(table.teacherStudents.studentId, studentId));
        if (teacherIds.length > 0) {
            await db.insert(table.teacherStudents).values(
                teacherIds.map((teacherId) => ({ studentId, teacherId })),
            );
        }
    },

    async create(payload: typeof createStudentSchema.static) {
        const { teacherIds, ...student } = payload;
        const [newStudent] = await db
            .insert(table.students)
            .values(student)
            .returning();
        await this.setTeachers(newStudent.id, teacherIds);
        return this.getById(newStudent.id);
    },

    async createMany(students: (typeof createStudentSchema.static)[]) {
        const values = students.map(({ teacherIds, ...student }) => student);
        const inserted = await db
            .insert(table.students)
            .values(values)
            .returning();

        await Promise.all(
            inserted.map((student, index) => this.setTeachers(student.id, students[index].teacherIds)),
        );

        const created = await Promise.all(inserted.map((student) => this.getById(student.id)));
        return created.filter((student) => student !== null);
    },

    async update(id: string, payload: typeof updateStudentSchema.static) {
        const { teacherIds, ...student } = payload;
        const [updatedStudent] = await db
            .update(table.students)
            .set(student)
            .where(eq(table.students.id, id))
            .returning();
        if (!updatedStudent) return null;
        await this.setTeachers(id, teacherIds);
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchStudentSchema.static) {
        const { teacherIds, ...student } = payload;
        const [patchedStudent] = await db
            .update(table.students)
            .set(student)
            .where(eq(table.students.id, id))
            .returning();
        if (!patchedStudent) return null;
        await this.setTeachers(id, teacherIds);
        return this.getById(id);
    },

    async remove(id: string) {
        await db.delete(table.groupStudents).where(eq(table.groupStudents.studentId, id));
        await db.delete(table.reservationStudents).where(eq(table.reservationStudents.studentId, id));
        await db.delete(table.teacherStudents).where(eq(table.teacherStudents.studentId, id));

        const [removedStudent] = await db
            .delete(table.students)
            .where(eq(table.students.id, id))
            .returning();
        return removedStudent;
    }
};
