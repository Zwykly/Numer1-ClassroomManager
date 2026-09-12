import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertClassroomReservationSchema, updateClassroomReservationSchema, patchClassroomReservationSchema, classroomReservationsQuerySchema } from "../models/classroom_reservations";
import { getLimit, getCursorWhere, getInArrayWhere, getDateRangeWhere, buildPaginationResponse } from "../utils/drizzle";

export const ClassroomReservationsService = {
    async getAll(query: typeof classroomReservationsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const statusWhere = getInArrayWhere("status", query.status);
        const dateWhere = getDateRangeWhere("reservationTime", query.from, query.to);

        const conditions = [cursorWhere, statusWhere, dateWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const data = await db.query.classroomReservations.findMany({
            where: whereClause,
            limit,
            orderBy: (res, { asc }) => [asc(res.id)],
            with: {
                users: true,
                groups: true,
                students: true,
                classrooms: true,
                onlineClassrooms: true,
            }
        });

        const mapped = data.map(res => {
            const { users, classrooms, onlineClassrooms, ...base } = res;

            return {
                ...base,
                teacher: users ?? undefined,
                groups: res.groups,
                students: res.students,
                classroom: classrooms ?? undefined,
                onlineClassroom: onlineClassrooms ?? undefined,
            };
        });

        return buildPaginationResponse(mapped, query.limit);
    },

    async getById(id: string) {
        const res = await db.query.classroomReservations.findFirst({
            where: { id },
            with: {
                users: true,
                groups: true,
                students: true,
                classrooms: true,
                onlineClassrooms: true,
            }
        });

        if (!res) return null;

        const { users, classrooms, onlineClassrooms, ...base } = res;

        return {
            ...base,
            teacher: users ?? undefined,
            groups: res.groups,
            students: res.students,
            classroom: classrooms ?? undefined,
            onlineClassroom: onlineClassrooms ?? undefined,
        };
    },

    async create(payload: typeof insertClassroomReservationSchema.static) {
        const [inserted] = await db
            .insert(table.classroomReservations)
            .values(payload)
            .returning();
        return this.getById(inserted.id);
    },

    async update(id: string, payload: typeof updateClassroomReservationSchema.static) {
        const [updated] = await db
            .update(table.classroomReservations)
            .set({ ...payload, editedOn: new Date() })
            .where(eq(table.classroomReservations.id, id))
            .returning();
        if (!updated) return null;
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchClassroomReservationSchema.static) {
        const [patched] = await db
            .update(table.classroomReservations)
            .set({ ...payload, editedOn: new Date() })
            .where(eq(table.classroomReservations.id, id))
            .returning();
        if (!patched) return null;
        return this.getById(id);
    },

    async remove(id: string) {
        const [removed] = await db
            .delete(table.classroomReservations)
            .where(eq(table.classroomReservations.id, id))
            .returning();
        return removed;
    }
};
