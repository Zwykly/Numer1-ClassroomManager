import { NotFoundError, status } from "elysia";
import { ClassroomReservationsService } from "../services/classroom_reservations";
import { ConflictsService } from "../services/conflicts";
import { OnlineClassroomsService } from "../services/online_classrooms";
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

async function assertNoSlotConflicts(slots: Date[], input: Parameters<typeof ConflictsService.checkSlots>[1]) {
    const result = await ConflictsService.checkSlots(slots, input);
    if (result.conflicts.length > 0) {
        throw status(409, result);
    }
}

// Proposed time for every occurrence from the selected one onward, shifted by the
// same delta as the edited occurrence so the whole future series moves together.
async function futureSlots(id: string, body: typeof patchClassroomReservationSchema.static, existing: { reservationTime: unknown }) {
    const { siblings } = await ClassroomReservationsService.getFutureSiblings(id);
    const selectedTime = new Date(existing.reservationTime as string).getTime();
    const delta = body.reservationTime
        ? new Date(body.reservationTime as unknown as string).getTime() - selectedTime
        : 0;

    return siblings.map((occurrence) => new Date(new Date(occurrence.reservationTime).getTime() + delta));
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

// Non-admins may only schedule classes in their own online classroom.
async function assertOnlineAccess(user: AuthUser, onlineClassroomId?: string | null) {
    if (!onlineClassroomId || isAdmin(user)) return;

    const ownerId = await OnlineClassroomsService.getOwnerId(onlineClassroomId);
    if (!ownerId || ownerId !== requireUserId(user)) {
        throw status(403, "You can only schedule classes in your own online classroom");
    }
}

export const ClassroomReservationsController = {
    async getAll({ query, user }: { query: typeof classroomReservationsQuerySchema.static; user: AuthUser }) {
        return await ClassroomReservationsService.getAll(query, {
            id: user?.userInfo?.id,
            isAdmin: isAdmin(user),
        });
    },

    async getCalendar({ query, user }: { query: typeof calendarReservationsQuerySchema.static; user: AuthUser }) {
        return await ClassroomReservationsService.getCalendar(query, {
            id: user?.userInfo?.id,
            isAdmin: isAdmin(user),
        });
    },

    async getById({ params: { id }, user }: { params: { id: string }; user: AuthUser }) {
        const res = await ClassroomReservationsService.getById(id);
        if (!res) throw new NotFoundError("Classroom Reservation not found");

        if (!isAdmin(user) && res.onlineClassroomId) {
            const ownerId = await OnlineClassroomsService.getOwnerId(res.onlineClassroomId);
            if (ownerId !== user?.userInfo?.id) throw new NotFoundError("Classroom Reservation not found");
        }

        return res;
    },

    async checkConflicts({ body, user }: { body: typeof checkConflictsSchema.static; user: AuthUser }) {
        await assertOnlineAccess(user, body.onlineClassroomId);
        const teacherId = isAdmin(user) ? (body.teacherId ?? requireUserId(user)) : requireUserId(user);
        return await ConflictsService.check({ ...body, teacherId });
    },

    async create({ body, user }: { body: typeof createClassroomReservationSchema.static; user: AuthUser }) {
        const teacherId = isAdmin(user) ? (body.teacherId ?? requireUserId(user)) : requireUserId(user);
        await assertOnlineAccess(user, body.onlineClassroomId);
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
        await assertOnlineAccess(user, body.onlineClassroomId);
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
        await assertOnlineAccess(user, body.onlineClassroomId !== undefined ? body.onlineClassroomId : existing.onlineClassroomId);
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
        await assertOnlineAccess(user, body.onlineClassroomId !== undefined ? body.onlineClassroomId : existing.onlineClassroomId);
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

    async checkFutureConflicts({ params: { id }, body, user }: { params: { id: string }; body: typeof patchClassroomReservationSchema.static; user: AuthUser }) {
        const existing = await assertCanEdit(id, user);
        await assertOnlineAccess(user, body.onlineClassroomId !== undefined ? body.onlineClassroomId : existing.onlineClassroomId);
        const teacherId = isAdmin(user) ? (body.teacherId ?? existing.teacherId) : requireUserId(user);
        const slots = await futureSlots(id, body, existing);
        return await ConflictsService.checkSlots(slots, {
            teacherId,
            classroomId: body.classroomId !== undefined ? body.classroomId : existing.classroomId,
            onlineClassroomId: body.onlineClassroomId !== undefined ? body.onlineClassroomId : existing.onlineClassroomId,
            durationMinutes: body.durationMinutes !== undefined ? body.durationMinutes : existing.durationMinutes,
            excludeCycleId: existing.cycleId ?? undefined,
        });
    },

    async patchFuture({ params: { id }, body, user }: { params: { id: string }; body: typeof patchClassroomReservationSchema.static; user: AuthUser }) {
        const existing = await assertCanEdit(id, user);
        await assertOnlineAccess(user, body.onlineClassroomId !== undefined ? body.onlineClassroomId : existing.onlineClassroomId);
        const teacherId = isAdmin(user) ? (body.teacherId ?? existing.teacherId) : requireUserId(user);
        const slots = await futureSlots(id, body, existing);
        await assertNoSlotConflicts(slots, {
            teacherId,
            classroomId: body.classroomId !== undefined ? body.classroomId : existing.classroomId,
            onlineClassroomId: body.onlineClassroomId !== undefined ? body.onlineClassroomId : existing.onlineClassroomId,
            durationMinutes: body.durationMinutes !== undefined ? body.durationMinutes : existing.durationMinutes,
            excludeCycleId: existing.cycleId ?? undefined,
        });
        return await ClassroomReservationsService.applyFuture(id, body);
    },

    async remove({ params: { id }, user }: { params: { id: string }; user: AuthUser }) {
        await assertCanEdit(id, user);
        const removed = await ClassroomReservationsService.remove(id);
        if (!removed) throw new NotFoundError("Classroom Reservation not found");
        return { success: true, reservation: removed };
    }
} as const;