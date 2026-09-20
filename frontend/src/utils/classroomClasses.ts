import type { Classroom } from "@/stores/useClassroomsStore";

export type ClassroomReservation = NonNullable<Classroom["reservations"]>[number];

const ENROLLED_STATUSES = new Set(["scheduled", "ongoing", "cyclical"]);

export type ClassroomClassEntry = {
    key: string;
    name: string | null;
    status: string;
    recurring: boolean;
    occurrences: number;
    firstTime: ClassroomReservation["reservationTime"];
};

export function isEnrolledClass(reservation: ClassroomReservation): boolean {
    return ENROLLED_STATUSES.has(reservation.status);
}

export function buildClassroomClasses(reservations?: ClassroomReservation[] | null): ClassroomClassEntry[] {
    if (!reservations) return [];

    const map = new Map<string, ClassroomClassEntry>();

    for (const reservation of reservations) {
        if (!isEnrolledClass(reservation)) continue;

        const key = reservation.cycleId ?? reservation.id;
        const existing = map.get(key);

        if (existing) {
            existing.occurrences += 1;
            if (new Date(reservation.reservationTime).getTime() < new Date(existing.firstTime).getTime()) {
                existing.firstTime = reservation.reservationTime;
            }
            continue;
        }

        map.set(key, {
            key,
            name: reservation.name,
            status: reservation.status,
            recurring: Boolean(reservation.cycleId),
            occurrences: 1,
            firstTime: reservation.reservationTime,
        });
    }

    return [...map.values()].sort(
        (a, b) => new Date(a.firstTime).getTime() - new Date(b.firstTime).getTime(),
    );
}

export function countClassroomClasses(reservations?: ClassroomReservation[] | null): number {
    return buildClassroomClasses(reservations).length;
}

export function upcomingClassroomClasses(
    reservations?: ClassroomReservation[] | null,
    limit = 4,
): ClassroomClassEntry[] {
    const now = Date.now();
    return buildClassroomClasses(reservations)
        .filter((entry) => entry.recurring || new Date(entry.firstTime).getTime() >= now)
        .slice(0, limit);
}
