import { NotFoundError, status } from "elysia";
import { ClassroomReservationsService } from "../services/classroom_reservations";
import { ConflictsService } from "../services/conflicts";
import { createClassroomReservationSchema, createRecurringReservationSchema, updateClassroomReservationSchema, patchClassroomReservationSchema, classroomReservationsQuerySchema, calendarReservationsQuerySchema, checkConflictsSchema } from "../models/classroom_reservations";

type AuthUser = {
    userInfo?: { id: string; role?: string | null } | null;
} | null;

const EDITABLE_STATUSES = ["scheduled", "cyclical", "ongoing"];

function isAdmin(user: AuthUser) {
    return user?.userInfo?.role === "admin";
}

function requireUserId(user: AuthUser) {
    if (!user?.userInfo?.id) throw status(403, "No user profile linked to this session");
    return user.userInfo.id;
}

async function assertNoConflicts(input: Parameters<typeof ConflictsService.check>[0]) {
    const result = await ConflictsService.check(input);
    if (result.conflicts.length > 0) {
        throw status(409, result);
    }
}

async function assertCanEdit(id: string, user: AuthUser) {
    const reservation = await ClassroomReservationsService.getById(id);
    if (!reservation) throw new NotFoundError("Classroom Reservation not found");

    if (!EDITABLE_STATUSES.includes(reservation.status)) {
        throw status(403, "Cancelled or completed classes cannot be edited");
    }

    if (!isAdmin(user) && reservation.teacherId !== user?.userInfo?.id) {
        throw status(403, "You can only edit classes assigned to you");
    }

    return reservation;
}

export const ClassroomReservationsController = {
    async getAll({ query }: { query: typeof classroomReservationsQuerySchema.static }) {
        return await ClassroomReservationsService.getAll(query);
    },

    async getCalendar({ query }: { query: typeof calendarReservationsQuerySchema.static }) {
        return await ClassroomReservationsService.getCalendar(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const res = await ClassroomReservationsService.getById(id);
        if (!res) throw new NotFoundError("Classroom Reservation not found");
        return res;
    },

    async checkConflicts({ body, user }: { body: typeof checkConflictsSchema.static; user: AuthUser }) {
        const teacherId = isAdmin(user) ? (body.teacherId ?? requireUserId(user)) : requireUserId(user);
        return await ConflictsService.check({ ...body, teacherId });
    },

    async create({ body, user }: { body: typeof createClassroomReservationSchema.static; user: AuthUser }) {
        const teacherId = isAdmin(user) ? (body.teacherId ?? requireUserId(user)) : requireUserId(user);
        await assertNoConflicts({
            teacherId,
            classroomId: body.classroomId ?? null,
            onlineClassroomId: body.onlineClassroomId ?? null,
            durationMinutes: body.durationMinutes ?? null,
            reservationTime: new Date(body.reservationTime as unknown as string).toISOString(),
        });
        const created = await ClassroomReservationsService.create({ ...body, teacherId });
        if (!created) throw new NotFoundError("Classroom Reservation not found");
        return created;
    },

    async createRecurring({ body, user }: { body: typeof createRecurringReservationSchema.static; user: AuthUser }) {
        const teacherId = isAdmin(user) ? (body.teacherId ?? requireUserId(user)) : requireUserId(user);
        await assertNoConflicts({
            teacherId,
            classroomId: body.classroomId ?? null,
            onlineClassroomId: body.onlineClassroomId ?? null,
            durationMinutes: body.durationMinutes ?? null,
            recurrence: {
                anchorDate: body.anchorDate,
                frequency: body.frequency,
                cycleEndDate: body.cycleEndDate,
                numberOfOccurrences: body.numberOfOccurrences,
                overrides: body.occurrenceOverrides,
            },
        });
        return await ClassroomReservationsService.createRecurring({ ...body, teacherId }, teacherId);
    },

    async update({ params: { id }, body, user }: { params: { id: string }; body: typeof updateClassroomReservationSchema.static; user: AuthUser }) {
        const existing = await assertCanEdit(id, user);
        await assertNoConflicts({
            teacherId: body.teacherId ?? existing.teacherId,
            classroomId: body.classroomId !== undefined ? body.classroomId : existing.classroomId,
            onlineClassroomId: body.onlineClassroomId !== undefined ? body.onlineClassroomId : existing.onlineClassroomId,
            durationMinutes: body.durationMinutes !== undefined ? body.durationMinutes : existing.durationMinutes,
            reservationTime: new Date((body.reservationTime ?? existing.reservationTime) as unknown as string).toISOString(),
            excludeId: id,
        });
        const updated = await ClassroomReservationsService.update(id, body);
        if (!updated) throw new NotFoundError("Classroom Reservation not found");
        return updated;
    },

    async patch({ params: { id }, body, user }: { params: { id: string }; body: typeof patchClassroomReservationSchema.static; user: AuthUser }) {
        const existing = await assertCanEdit(id, user);
        await assertNoConflicts({
            teacherId: body.teacherId ?? existing.teacherId,
            classroomId: body.classroomId !== undefined ? body.classroomId : existing.classroomId,
            onlineClassroomId: body.onlineClassroomId !== undefined ? body.onlineClassroomId : existing.onlineClassroomId,
            durationMinutes: body.durationMinutes !== undefined ? body.durationMinutes : existing.durationMinutes,
            reservationTime: new Date((body.reservationTime ?? existing.reservationTime) as unknown as string).toISOString(),
            excludeId: id,
        });
        const patched = await ClassroomReservationsService.patch(id, body);
        if (!patched) throw new NotFoundError("Classroom Reservation not found");
        return patched;
    },

    async remove({ params: { id }, user }: { params: { id: string }; user: AuthUser }) {
        await assertCanEdit(id, user);
        const removed = await ClassroomReservationsService.remove(id);
        if (!removed) throw new NotFoundError("Classroom Reservation not found");
        return { success: true, reservation: removed };
    }
} as const;
