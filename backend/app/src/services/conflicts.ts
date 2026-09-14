import { db } from "../db/db";
import { table } from "../db/schema";
import { checkConflictsSchema, conflictResultSchema } from "../models/classroom_reservations";
import { buildOccurrenceDates, durationOf, endOf, intervalsOverlap } from "../utils/schedule";

const SUGGESTION_STEP_MINUTES = 30;
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 20;
const MAX_SUGGESTION_DAYS = 21;
const MAX_SUGGESTION_ATTEMPTS = 400;

type CheckInput = typeof checkConflictsSchema.static;
type BusyReservation = any;

function teacherName(reservation: BusyReservation): string | null {
    if (!reservation.users) return null;
    return `${reservation.users.firstName} ${reservation.users.lastName}`.trim();
}

function roomName(reservation: BusyReservation): string | null {
    return reservation.classrooms?.name ?? reservation.onlineClassrooms?.name ?? null;
}

function roundUpToStep(date: Date, stepMinutes: number): Date {
    const rounded = new Date(date);
    rounded.setSeconds(0, 0);
    const remainder = rounded.getMinutes() % stepMinutes;
    if (remainder !== 0) {
        rounded.setMinutes(rounded.getMinutes() + (stepMinutes - remainder));
    }
    return rounded;
}

function dayAt(date: Date, hour: number): Date {
    const result = new Date(date);
    result.setHours(hour, 0, 0, 0);
    return result;
}

export const ConflictsService = {
    async getBusy(input: CheckInput): Promise<BusyReservation[]> {
        const matches: Record<string, any>[] = [];
        if (input.classroomId) matches.push({ classroomId: input.classroomId });
        if (input.onlineClassroomId) matches.push({ onlineClassroomId: input.onlineClassroomId });
        if (input.teacherId) matches.push({ teacherId: input.teacherId });
        if (matches.length === 0) return [];

        const rows = await db.query.classroomReservations.findMany({
            where: {
                OR: matches,
                status: { notIn: ["canceled", "completed"] },
            },
            with: {
                users: true,
                classrooms: true,
                onlineClassrooms: true,
            },
        });

        return rows.filter((reservation) =>
            reservation.id !== input.excludeId
            && (!input.excludeCycleId || reservation.cycleId !== input.excludeCycleId),
        );
    },

    matchesProposed(start: Date, input: CheckInput, reservation: BusyReservation): ("room" | "teacher")[] {
        const proposedEnd = endOf(start, input.durationMinutes);
        const busyStart = new Date(reservation.reservationTime);
        const busyEnd = endOf(busyStart, reservation.durationMinutes);

        if (!intervalsOverlap(start, proposedEnd, busyStart, busyEnd)) return [];

        const reasons: ("room" | "teacher")[] = [];
        const roomMatch = (input.classroomId && reservation.classroomId === input.classroomId)
            || (input.onlineClassroomId && reservation.onlineClassroomId === input.onlineClassroomId);
        if (roomMatch) reasons.push("room");
        if (input.teacherId && reservation.teacherId === input.teacherId) reasons.push("teacher");
        return reasons;
    },

    slotHasConflict(busy: BusyReservation[], start: Date, input: CheckInput): boolean {
        return busy.some((reservation) => this.matchesProposed(start, input, reservation).length > 0);
    },

    suggestSlot(busy: BusyReservation[], preferred: Date, input: CheckInput): Date | undefined {
        const duration = durationOf(input.durationMinutes);
        const dayEndMinutes = DAY_END_HOUR * 60;
        let attempts = 0;

        for (let dayOffset = 0; dayOffset < MAX_SUGGESTION_DAYS; dayOffset++) {
            const dayStart = dayAt(preferred, DAY_START_HOUR);
            dayStart.setDate(dayStart.getDate() + dayOffset);
            const dayEnd = dayAt(dayStart, DAY_END_HOUR);
            let candidate = dayOffset === 0 ? roundUpToStep(preferred, SUGGESTION_STEP_MINUTES) : dayStart;

            if (candidate < dayStart) candidate = dayStart;

            while (candidate.getTime() + duration * 60_000 <= dayEnd.getTime()) {
                attempts += 1;
                if (attempts > MAX_SUGGESTION_ATTEMPTS) return undefined;
                if (candidate.getTime() > preferred.getTime() || dayOffset > 0) {
                    if (!this.slotHasConflict(busy, candidate, input)) return candidate;
                }
                candidate = new Date(candidate.getTime() + SUGGESTION_STEP_MINUTES * 60_000);
            }
        }

        return undefined;
    },

    suggestSeries(busy: BusyReservation[], slots: Date[], input: CheckInput): Date | undefined {
        const duration = durationOf(input.durationMinutes);
        const startMinutes = DAY_START_HOUR * 60;
        const endMinutes = DAY_END_HOUR * 60;

        let best: Date | undefined;
        let bestCount = Number.POSITIVE_INFINITY;

        for (let minutes = startMinutes; minutes + duration <= endMinutes; minutes += SUGGESTION_STEP_MINUTES) {
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            const candidates = slots.map((slot) => {
                const candidate = new Date(slot);
                candidate.setHours(hour, minute, 0, 0);
                return candidate;
            });

            const conflictCount = candidates.filter((candidate) => this.slotHasConflict(busy, candidate, input)).length;
            if (conflictCount === 0) return candidates[0];
            if (conflictCount < bestCount) {
                bestCount = conflictCount;
                best = candidates[0];
            }
        }

        return best;
    },

    async check(input: CheckInput): Promise<typeof conflictResultSchema.static> {
        let slots: Date[] = [];
        if (input.recurrence) {
            slots = buildOccurrenceDates({
                anchorDate: input.recurrence.anchorDate,
                frequency: input.recurrence.frequency,
                cycleEndDate: input.recurrence.cycleEndDate,
                numberOfOccurrences: input.recurrence.numberOfOccurrences,
                overrides: input.recurrence.overrides,
            });
        } else if (input.reservationTime) {
            slots = [new Date(input.reservationTime)];
        }

        return this.checkSlots(slots, input);
    },

    async checkSlots(slots: Date[], input: CheckInput): Promise<typeof conflictResultSchema.static> {
        if (slots.length === 0) return { conflicts: [] };

        const busy = await this.getBusy(input);
        const conflicts: (typeof conflictResultSchema.static)["conflicts"] = [];

        slots.forEach((start, index) => {
            const items = busy
                .map((reservation) => {
                    const reasons = this.matchesProposed(start, input, reservation);
                    return reasons.map((type) => ({
                        type,
                        reservationId: reservation.id,
                        name: reservation.name ?? null,
                        reservationTime: new Date(reservation.reservationTime).toISOString(),
                        durationMinutes: reservation.durationMinutes ?? null,
                        teacherName: teacherName(reservation),
                        roomName: roomName(reservation),
                    }));
                })
                .flat();

            if (items.length === 0) return;

            const suggestion = this.suggestSlot(busy, start, input);
            conflicts.push({
                index,
                reservationTime: start.toISOString(),
                items,
                ...(suggestion ? { suggestion: suggestion.toISOString() } : {}),
            });
        });

        const result: {
            conflicts: typeof conflicts;
            allConflicted?: boolean;
            suggestedAnchor?: string;
        } = { conflicts };

        if (input.recurrence && conflicts.length === slots.length && slots.length > 0) {
            result.allConflicted = true;
            const suggested = this.suggestSeries(busy, slots, input);
            if (suggested) result.suggestedAnchor = suggested.toISOString();
        }

        return result;
    },
};
