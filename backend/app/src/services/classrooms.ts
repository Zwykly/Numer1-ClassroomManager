import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertClassroomSchema, updateClassroomSchema, patchClassroomSchema, classroomsQuerySchema } from "../models/classrooms";
import { getLimit, getCursorWhere, getInArrayWhere, buildPaginationResponse } from "../utils/drizzle";

export const ClassroomsService = {
    async getAll(query: typeof classroomsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const statusWhere = getInArrayWhere("status", query.status);

        const conditions = [cursorWhere, statusWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const data = await db.query.classrooms.findMany({
            where: whereClause,
            limit,
            orderBy: (classrooms, { asc }) => [asc(classrooms.id)],
            with: {
                classroomReservations: true,
            }
        });

        const mapped = data.map(c => ({
            ...c,
            reservations: c.classroomReservations
        }));

        return buildPaginationResponse(mapped, query.limit);
    },

    async getById(id: string) {
        const classroom = await db.query.classrooms.findFirst({
            where: { id },
            with: {
                classroomReservations: true,
            }
        });

        if (!classroom) return null;

        return {
            ...classroom,
            reservations: classroom.classroomReservations
        };
    },

    async create(payload: typeof insertClassroomSchema.static) {
        const [inserted] = await db
            .insert(table.classrooms)
            .values(payload)
            .returning();
        return this.getById(inserted.id);
    },

    async update(id: string, payload: typeof updateClassroomSchema.static) {
        const [updated] = await db
            .update(table.classrooms)
            .set(payload)
            .where(eq(table.classrooms.id, id))
            .returning();
        if (!updated) return null;
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchClassroomSchema.static) {
        const [patched] = await db
            .update(table.classrooms)
            .set(payload)
            .where(eq(table.classrooms.id, id))
            .returning();
        if (!patched) return null;
        return this.getById(id);
    },

    async remove(id: string) {
        const [removed] = await db
            .delete(table.classrooms)
            .where(eq(table.classrooms.id, id))
            .returning();
        return removed;
    }
};
