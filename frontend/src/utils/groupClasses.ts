import type { Group } from "@/stores/useGroupsStore";

export type GroupReservation = NonNullable<Group["reservations"]>[number];

const ENROLLED_STATUSES = new Set(["scheduled", "ongoing", "cyclical"]);

export type GroupClassEntry = {
    key: string;
    name: string | null;
    status: string;
    recurring: boolean;
    occurrences: number;
    firstTime: GroupReservation["reservationTime"];
};

export function isEnrolledClass(reservation: GroupReservation): boolean {
    return ENROLLED_STATUSES.has(reservation.status);
}

export function buildGroupClasses(reservations?: GroupReservation[] | null): GroupClassEntry[] {
    if (!reservations) return [];

    const map = new Map<string, GroupClassEntry>();

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

export function countGroupClasses(reservations?: GroupReservation[] | null): number {
    return buildGroupClasses(reservations).length;
}
