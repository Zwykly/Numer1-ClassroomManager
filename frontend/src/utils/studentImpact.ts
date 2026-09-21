import type { Student } from "@/stores/useStudentsStore";

export type StudentReservation = NonNullable<Student["reservations"]>[number];

export type UpcomingClassEntry = {
    key: string;
    name: string | null;
    recurring: boolean;
    occurrences: number;
    nextTime: StudentReservation["reservationTime"];
};

const HIDDEN_STATUSES = new Set(["canceled", "completed"]);

export function upcomingStudentClasses(reservations?: StudentReservation[] | null): UpcomingClassEntry[] {
    if (!reservations) return [];

    const now = Date.now();
    const map = new Map<string, UpcomingClassEntry>();

    for (const reservation of reservations) {
        const time = new Date(reservation.reservationTime).getTime();
        if (Number.isNaN(time) || time < now) continue;
        if (HIDDEN_STATUSES.has(reservation.status)) continue;

        const key = reservation.cycleId ?? reservation.id;
        const existing = map.get(key);

        if (existing) {
            existing.occurrences += 1;
            if (time < new Date(existing.nextTime).getTime()) {
                existing.nextTime = reservation.reservationTime;
            }
            continue;
        }

        map.set(key, {
            key,
            name: reservation.name,
            recurring: Boolean(reservation.cycleId),
            occurrences: 1,
            nextTime: reservation.reservationTime,
        });
    }

    return [...map.values()].sort(
        (a, b) => new Date(a.nextTime).getTime() - new Date(b.nextTime).getTime(),
    );
}

export function studentGroupNames(student?: Student | null): string[] {
    return (student?.groups ?? []).map((group) => group.name);
}

export type RecurringClassEntry = {
    key: string;
    name: string | null;
    occurrences: number;
    firstTime: StudentReservation["reservationTime"];
    nextTime: StudentReservation["reservationTime"] | null;
};

// Every recurring series (cycle) the student is enrolled in, regardless of
// whether the individual occurrences are in the past or future.
export function recurringStudentClasses(reservations?: StudentReservation[] | null): RecurringClassEntry[] {
    if (!reservations) return [];

    const now = Date.now();
    const map = new Map<string, RecurringClassEntry>();

    for (const reservation of reservations) {
        if (!reservation.cycleId) continue;

        const time = new Date(reservation.reservationTime).getTime();
        if (Number.isNaN(time)) continue;

        const existing = map.get(reservation.cycleId);
        if (existing) {
            existing.occurrences += 1;
            if (time < new Date(existing.firstTime).getTime()) existing.firstTime = reservation.reservationTime;
            if (time >= now && (!existing.nextTime || time < new Date(existing.nextTime).getTime())) {
                existing.nextTime = reservation.reservationTime;
            }
            continue;
        }

        map.set(reservation.cycleId, {
            key: reservation.cycleId,
            name: reservation.name,
            occurrences: 1,
            firstTime: reservation.reservationTime,
            nextTime: time >= now ? reservation.reservationTime : null,
        });
    }

    return [...map.values()].sort(
        (a, b) => new Date(a.firstTime).getTime() - new Date(b.firstTime).getTime(),
    );
}
