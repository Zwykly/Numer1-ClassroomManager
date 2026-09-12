import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { createClassroomReservationSchema, createRecurringReservationSchema, updateClassroomReservationSchema, patchClassroomReservationSchema, classroomReservationsQuerySchema } from "../models/classroom_reservations";
import { getLimit, getCursorWhere, getInArrayWhere, getDateRangeWhere, getFuzzySearchWhere, buildPaginationResponse } from "../utils/drizzle";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_GENERATED_OCCURRENCES = 200;

const reservationRelations = {
    users: true,
    groups: { with: { students: true } },
    students: true,
    classrooms: true,
    onlineClassrooms: true,
} as const;

function mapReservation(res: any) {
    const { users, classrooms, onlineClassrooms, ...base } = res;

    return {
        ...base,
        teacher: users ?? undefined,
        groups: res.groups,
        students: res.students,
        classroom: classrooms ?? undefined,
        onlineClassroom: onlineClassrooms ?? undefined,
    };
}

export const ClassroomReservationsService = {
    buildViewWhere(view?: typeof classroomReservationsQuerySchema.static.view): Record<string, any> | undefined {
        if (!view || view === "all") return undefined;

        if (view === "recurring") {
            return {
                OR: [
                    { status: "cyclical" },
                    { cycleId: { isNotNull: true } },
                ],
            };
        }

        if (view === "upcoming") {
            return {
                status: "scheduled",
                reservationTime: { gte: new Date() },
            };
        }

        if (view === "archived") {
            return {
                OR: [
                    { status: { in: ["canceled", "completed"] } },
                    { cycle: { status: "archived" } },
                ],
            };
        }

        return undefined;
    },

    async getAll(query: typeof classroomReservationsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const statusWhere = getInArrayWhere("status", query.status);
        const dateWhere = getDateRangeWhere("reservationTime", query.from, query.to);
        const searchWhere = getFuzzySearchWhere(["name"], query.search);
        const viewWhere = this.buildViewWhere(query.view);

        const conditions = [cursorWhere, statusWhere, dateWhere, searchWhere, viewWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const data = await db.query.classroomReservations.findMany({
            where: whereClause,
            limit,
            orderBy: (res, { asc }) => [asc(res.reservationTime)],
            with: reservationRelations,
        });

        return buildPaginationResponse(data.map(mapReservation), query.limit);
    },

    async getById(id: string) {
        const res = await db.query.classroomReservations.findFirst({
            where: { id },
            with: reservationRelations,
        });

        if (!res) return null;
        return mapReservation(res);
    },

    async setAttendees(reservationId: string, studentIds?: string[], groupIds?: string[]) {
        if (studentIds) {
            await db.delete(table.reservationStudents).where(eq(table.reservationStudents.reservationId, reservationId));
            if (studentIds.length > 0) {
                await db.insert(table.reservationStudents).values(
                    studentIds.map((studentId) => ({ reservationId, studentId })),
                );
            }
        }

        if (groupIds) {
            await db.delete(table.reservationGroups).where(eq(table.reservationGroups.reservationId, reservationId));
            if (groupIds.length > 0) {
                await db.insert(table.reservationGroups).values(
                    groupIds.map((groupId) => ({ reservationId, groupId })),
                );
            }
        }
    },

    buildOccurrences(payload: typeof createRecurringReservationSchema.static) {
        const anchor = new Date(payload.anchorDate);
        const end = payload.cycleEndDate ? new Date(payload.cycleEndDate) : null;
        const frequency = Math.max(payload.frequency, 1);
        const max = payload.numberOfOccurrences
            ? Math.min(payload.numberOfOccurrences, MAX_GENERATED_OCCURRENCES)
            : MAX_GENERATED_OCCURRENCES;

        const dates: Date[] = [];
        let current = new Date(anchor);
        while (dates.length < max) {
            if (end && current > end) break;
            dates.push(new Date(current));
            current = new Date(current.getTime() + frequency * MS_PER_DAY);
        }

        return dates;
    },

    async create(payload: typeof createClassroomReservationSchema.static) {
        const { studentIds, groupIds, ...reservation } = payload;
        const [inserted] = await db
            .insert(table.classroomReservations)
            .values(reservation)
            .returning();
        await this.setAttendees(inserted.id, studentIds, groupIds);
        return this.getById(inserted.id);
    },

    async createRecurring(payload: typeof createRecurringReservationSchema.static, teacherId?: string) {
        const occurrences = this.buildOccurrences(payload);
        const ownerId = payload.teacherId ?? teacherId;

        if (!ownerId) return [];
        if (occurrences.length === 0) return [];

        const [cycle] = await db
            .insert(table.reservationCycles)
            .values({
                teacherId: ownerId,
                additionalInfo: payload.additionalInfo ?? null,
                anchorDate: new Date(payload.anchorDate),
                cycleEndDate: payload.cycleEndDate ? new Date(payload.cycleEndDate) : null,
                numberOfOccurrences: payload.numberOfOccurrences ?? occurrences.length,
                frequency: payload.frequency,
                status: "active",
            })
            .returning();

        const createdIds: string[] = [];
        for (const date of occurrences) {
            const [inserted] = await db
                .insert(table.classroomReservations)
                .values({
                    name: payload.name,
                    classroomId: payload.classroomId ?? null,
                    onlineClassroomId: payload.onlineClassroomId ?? null,
                    reservationTime: date,
                    teacherId: ownerId,
                    additionalInfo: payload.additionalInfo ?? null,
                    status: "cyclical",
                    cycleId: cycle.id,
                })
                .returning();
            await this.setAttendees(inserted.id, payload.studentIds, payload.groupIds);
            createdIds.push(inserted.id);
        }

        const created = await Promise.all(createdIds.map((id) => this.getById(id)));
        return created.filter(Boolean);
    },

    async update(id: string, payload: typeof updateClassroomReservationSchema.static & { studentIds?: string[]; groupIds?: string[] }) {
        const { studentIds, groupIds, ...reservation } = payload;
        const [updated] = await db
            .update(table.classroomReservations)
            .set({ ...reservation, editedOn: new Date() })
            .where(eq(table.classroomReservations.id, id))
            .returning();
        if (!updated) return null;
        await this.setAttendees(id, studentIds, groupIds);
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchClassroomReservationSchema.static) {
        const { studentIds, groupIds, ...reservation } = payload;
        const [patched] = await db
            .update(table.classroomReservations)
            .set({ ...reservation, editedOn: new Date() })
            .where(eq(table.classroomReservations.id, id))
            .returning();
        if (!patched) return null;
        await this.setAttendees(id, studentIds, groupIds);
        return this.getById(id);
    },

    async remove(id: string) {
        await db.delete(table.reservationStudents).where(eq(table.reservationStudents.reservationId, id));
        await db.delete(table.reservationGroups).where(eq(table.reservationGroups.reservationId, id));
        const [removed] = await db
            .delete(table.classroomReservations)
            .where(eq(table.classroomReservations.id, id))
            .returning();
        return removed;
    },
};
