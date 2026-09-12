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
