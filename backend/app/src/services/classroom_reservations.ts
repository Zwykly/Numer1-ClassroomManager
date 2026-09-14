import { and, eq, gte, inArray, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { createClassroomReservationSchema, createRecurringReservationSchema, updateClassroomReservationSchema, patchClassroomReservationSchema, classroomReservationsQuerySchema, calendarReservationsQuerySchema } from "../models/classroom_reservations";
import { getLimit, getCursorWhere, getInArrayWhere, getDateRangeWhere, getFuzzySearchWhere, buildPaginationResponse } from "../utils/drizzle";
import { buildOccurrenceDates } from "../utils/schedule";

const reservationRelations = {
    users: true,
    groups: { with: { students: true } },
    students: true,
    classrooms: true,
    onlineClassrooms: true,
} as const;

const calendarRelations = {
    users: true,
    groups: true,
    classrooms: true,
    onlineClassrooms: true,
} as const;

type Viewer = {
    id?: string;
    isAdmin: boolean;
};

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

// Hides the details of a class the viewer is not allowed to see. Only the status,
// whether it recurs and the slot itself remain visible.
function maskReservation(reservation: ReturnType<typeof mapReservation>) {
    return {
        ...reservation,
        name: null,
        additionalInfo: null,
        teacher: undefined,
        groups: [],
        students: [],
        classroom: undefined,
        onlineClassroom: undefined,
        restricted: true,
    };
}

export const ClassroomReservationsService = {
    buildViewWhere(view?: typeof classroomReservationsQuerySchema.static.view): Record<string, any> | undefined {
        if (!view) return undefined;

        if (view === "all") {
            return {
                status: { notIn: ["canceled", "completed"] },
                OR: [
                    { status: "ongoing" },
                    { reservationTime: { gte: new Date() } },
                ],
            };
        }

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
                status: { in: ["canceled", "completed"] },
            };
        }

        return undefined;
    },

    async getOwnOnlineClassroomId(userId: string) {
        const oc = await db.query.onlineClassrooms.findFirst({ where: { teacherId: userId } });
        return oc?.id;
    },

    // Reservations on an online classroom are only visible to the teacher they
    // belong to and to administrators.
    async onlineVisibilityWhere(viewer?: Viewer): Promise<Record<string, any> | undefined> {
        if (!viewer || viewer.isAdmin || !viewer.id) return undefined;

        const ownOnlineId = await this.getOwnOnlineClassroomId(viewer.id);
        return {
            OR: [
                { onlineClassroomId: { isNull: true } },
                ...(ownOnlineId ? [{ onlineClassroomId: ownOnlineId }] : []),
            ],
        };
    },

    async getAll(query: typeof classroomReservationsQuerySchema.static, viewer?: Viewer) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const statusWhere = getInArrayWhere("status", query.status);
        const dateWhere = getDateRangeWhere("reservationTime", query.from, query.to);
        const searchWhere = getFuzzySearchWhere(["name"], query.search);
        const viewWhere = this.buildViewWhere(query.view);
        const onlineWhere = await this.onlineVisibilityWhere(viewer);

        const conditions = [cursorWhere, statusWhere, dateWhere, searchWhere, viewWhere, onlineWhere].filter(Boolean);
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

    async getCalendar(query: typeof calendarReservationsQuerySchema.static, viewer?: Viewer) {
        const dateWhere = getDateRangeWhere("reservationTime", query.from, query.to);
        const classroomWhere = query.classroomId ? { classroomId: query.classroomId } : undefined;
        const onlineClassroomWhere = query.onlineClassroomId ? { onlineClassroomId: query.onlineClassroomId } : undefined;
        const includeOnlineWhere = query.includeOnline === false ? { onlineClassroomId: { isNull: true } } : undefined;
        const visibilityWhere = await this.onlineVisibilityWhere(viewer);

        const conditions = [dateWhere, classroomWhere, onlineClassroomWhere, includeOnlineWhere, visibilityWhere].filter(Boolean);
        const whereClause: any = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const data = await db.query.classroomReservations.findMany({
            where: whereClause,
            orderBy: (res, { asc }) => [asc(res.reservationTime)],
            with: calendarRelations,
        });

        const mapped = data.map(mapReservation);
        if (!viewer || viewer.isAdmin) {
            return mapped.map((reservation) => ({ ...reservation, restricted: false }));
        }

        return mapped.map((reservation) => (
            reservation.teacherId === viewer.id
                ? { ...reservation, restricted: false }
                : maskReservation(reservation)
        ));
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
        return buildOccurrenceDates({
            anchorDate: payload.anchorDate,
            frequency: payload.frequency,
            cycleEndDate: payload.cycleEndDate,
            numberOfOccurrences: payload.numberOfOccurrences,
            overrides: payload.occurrenceOverrides,
        });
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
                    durationMinutes: payload.durationMinutes ?? null,
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

    // The selected occurrence together with every later occurrence of the same cycle.
    async getFutureSiblings(id: string) {
        const selected = await db.query.classroomReservations.findFirst({ where: { id } });
        if (!selected || !selected.cycleId) return { selected: selected ?? null, siblings: [] };

        const siblings = await db.query.classroomReservations.findMany({
            where: {
                cycleId: selected.cycleId,
                reservationTime: { gte: selected.reservationTime },
            },
            orderBy: (res, { asc }) => [asc(res.reservationTime)],
        });

        return { selected, siblings };
    },

    // Applies the changes to the selected occurrence and all future ones, shifting
    // every date by the same delta so the recurrence spacing is preserved.
    async applyFuture(id: string, payload: typeof patchClassroomReservationSchema.static) {
        const { studentIds, groupIds, reservationTime, ...fields } = payload;
        const { selected, siblings } = await this.getFutureSiblings(id);
        if (!selected) return [];

        const selectedTime = new Date(selected.reservationTime).getTime();
        const delta = reservationTime ? new Date(reservationTime).getTime() - selectedTime : 0;

        const updatedIds: string[] = [];
        for (const occurrence of siblings) {
            const nextTime = delta !== 0
                ? new Date(new Date(occurrence.reservationTime).getTime() + delta)
                : undefined;

            const [updated] = await db
                .update(table.classroomReservations)
                .set({
                    ...fields,
                    ...(nextTime ? { reservationTime: nextTime } : {}),
                    editedOn: new Date(),
                })
                .where(eq(table.classroomReservations.id, occurrence.id))
                .returning();
            if (!updated) continue;

            await this.setAttendees(occurrence.id, studentIds, groupIds);
            updatedIds.push(occurrence.id);
        }

        if (selected.cycleId && delta !== 0) {
            const cycle = await db.query.reservationCycles.findFirst({ where: { id: selected.cycleId } });
            if (cycle) {
                await db
                    .update(table.reservationCycles)
                    .set({ anchorDate: new Date(new Date(cycle.anchorDate).getTime() + delta) })
                    .where(eq(table.reservationCycles.id, selected.cycleId));
            }
        }

        const updated = await Promise.all(updatedIds.map((updatedId) => this.getById(updatedId)));
        return updated.filter(Boolean);
    },

    async startDueReservations() {
        const now = new Date();
        const started = await db
            .update(table.classroomReservations)
            .set({ status: "ongoing", editedOn: now })
            .where(and(
                inArray(table.classroomReservations.status, ["scheduled", "cyclical"]),
                lte(table.classroomReservations.reservationTime, now),
            ))
            .returning({ id: table.classroomReservations.id });
        return started.length;
    },

    async completeFinishedReservations() {
        const completed = await db
            .update(table.classroomReservations)
            .set({ status: "completed", editedOn: new Date() })
            .where(and(
                eq(table.classroomReservations.status, "ongoing"),
                isNotNull(table.classroomReservations.durationMinutes),
                sql`${table.classroomReservations.reservationTime} + (${table.classroomReservations.durationMinutes} * interval '1 minute') <= now()`,
            ))
            .returning({ id: table.classroomReservations.id });
        return completed.length;
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
